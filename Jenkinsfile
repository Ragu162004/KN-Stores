pipeline {
    agent any

    environment {
        VERSION = "${BUILD_NUMBER}" 
        FRONTEND_IMAGE = "ragu162004/client-app"
        BACKEND_IMAGE = "ragu162004/server-app"
        DOCKER_CREDENTIALS_ID = 'docker_cred'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', credentialsId: 'github_cred', url: 'https://github.com/Ragu162004/KN-Stores.git'
            }
        }

        stage('Build Frontend & Backend Images') {
            steps {
                script {
                    docker.build("${FRONTEND_IMAGE}:${VERSION}", '--no-cache ./client')
                    docker.build("${BACKEND_IMAGE}:${VERSION}", '--no-cache ./server')
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        docker.image("${FRONTEND_IMAGE}:${VERSION}").push()
                        docker.image("${BACKEND_IMAGE}:${VERSION}").push()
                        // docker.image("${FRONTEND_IMAGE}:${VERSION}").tag('latest')
                        // docker.image("${BACKEND_IMAGE}:${VERSION}").tag('latest')
                        // docker.image("${FRONTEND_IMAGE}:latest").push()
                        // docker.image("${BACKEND_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker system prune -f'
            }
        }
    }

    post {
        success {
            echo "🎉 Images pushed with version tag: ${VERSION}"
        }
        failure {
            echo '❌ Something went wrong with the build or push.'
        }
    }
}