pipeline {
    agent { 
        label 'docker-agent' 
    }

    parameters {
        choice(
            name: 'ENV',
            choices: ['dev', 'prod'],
            description: 'Select the environment (used for tagging or logic)'
        )
        booleanParam(
            name: 'REBUILD_IMAGE',
            defaultValue: true,
            description: 'Uncheck this if you want to skip building and use the existing image cache.'
        )
        string(
            name: 'TAG_NAME',
            defaultValue: 'latest',
            description: 'Docker tag name'
        )
        string(
            name: 'CONTAINER_NAME',
            defaultValue: 'dev_jenkins',
            description: 'Docker container name'
        )
        string(
            name: 'PORT_FORWARD',
            defaultValue: '3000',
            description: 'Host port to forward to container port'
        )
        string(
            name: 'BRANCH_TO_BUILD',
            defaultValue: 'main',
            description: 'Which GitHub branch to pull and build?'
        )
    }

    environment {
        IMAGE_NAME = "bussiness_analyze_${params.ENV}:${params.TAG_NAME}"
        CONTAINER_NAME = "${params.CONTAINER_NAME}"
        ENV_SECRET_ID = 'bussiness-analyze-env' 
    }

    options {
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Cleaning workspace before checkout..."
                    cleanWs() 
                    
                    echo "Checking out branch: ${params.BRANCH_TO_BUILD}"
                }

                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${params.BRANCH_TO_BUILD}"]], // Dynamically uses the branch param
                    userRemoteConfigs: [[
                        url: 'https://github.com/ptrw0311/Business_Performance_Analysis_Platform.git',
                        credentialsId: 'Willy_Git'
                    ]]
                ])
            }
        }
        stage('Build Docker Image') {
            when {
                expression { return params.REBUILD_IMAGE == true }
            }
            steps {
                script {
                    // We only need the username/password for the build-arg, not for the checkout (handled above)
                    withCredentials([usernamePassword(
                        credentialsId: 'Willy_Git',
                        usernameVariable: 'GITHUB_USER',
                        passwordVariable: 'GITHUB_TOKEN'
                    )]) {
                        echo "Building Docker image..."
                        // Using double quotes """ allows Groovy variable interpolation ${}
                        sh """
                        docker build --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} -t ${IMAGE_NAME} .
                        """
                    }
                }
            }
        }
        stage('Deploy Container') {
            steps {
                script {
                    echo "Deploying container with .env file from Jenkins..."
                    
                    // This block retrieves the Secret File from Jenkins and assigns its path to 'MY_ENV_FILE'
                    withCredentials([file(credentialsId: "${ENV_SECRET_ID}", variable: 'MY_ENV_FILE')]) {
                        
                        // We copy the secret file to the workspace as '.env' to ensure Docker can mount it 
                        // regardless of agent path complexities.
                        sh """
                        cat "\${MY_ENV_FILE}" > .env
                        """
                        
                        sh """
                        # Remove old container if it exists
                        docker rm -f ${CONTAINER_NAME} || true
                        
                        # Run new container with --env-file
                        docker run -d \\
                            --name ${CONTAINER_NAME} \\
                            -p ${params.PORT_FORWARD}:3000 \\
                            --env-file .env \\
                            ${IMAGE_NAME}
                        """
                        
                        // Clean up the sensitive .env file from the workspace after launch
                        sh 'rm .env'
                    }
                }
            }
        }
    }
}
