pipeline {
    agent any

    environment {
        VERSION = "${BUILD_NUMBER}"
        FRONTEND_IMAGE = "ragu162004/client-app"
        BACKEND_IMAGE = "ragu162004/server-app"
        DOCKER_CREDENTIALS_ID = 'docker_cred'
        GIT_CREDENTIALS_ID = 'github_cred'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo "📥 Cloning repository..."
                git branch: 'main', credentialsId: "${GIT_CREDENTIALS_ID}", url: 'git@github.com:Ragu162004/KN-Stores.git'
            }
        }

        stage('Build Frontend & Backend Images') {
            steps {
                script {
                    echo "🔨 Building frontend image: ${FRONTEND_IMAGE}:${VERSION}"
                    docker.build("${FRONTEND_IMAGE}:${VERSION}", '--no-cache ./client')

                    echo "🔨 Building backend image: ${BACKEND_IMAGE}:${VERSION}"
                    docker.build("${BACKEND_IMAGE}:${VERSION}", '--no-cache ./server')
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    echo "📦 Pushing images to Docker Hub..."
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        docker.image("${FRONTEND_IMAGE}:${VERSION}").push()
                        docker.image("${BACKEND_IMAGE}:${VERSION}").push()

                        docker.image("${FRONTEND_IMAGE}:${VERSION}").tag('latest')
                        docker.image("${BACKEND_IMAGE}:${VERSION}").tag('latest')
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Tag Git Repository') {
            steps {
                script {
                    echo "🏷️ Creating and pushing Git tag v${VERSION}..."
                    sh """
                        git config user.email "ragu16102004@gmail.com"
                        git config user.name "Ragu162004"
                        git tag v${VERSION}
                        git push origin v${VERSION}
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up unused Docker images..."
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo "✅ Build, push, and tagging successful! Version: ${VERSION}"
        }
        failure {
            echo "❌ Build or push failed. Check logs above for details."
        }
    }
}
