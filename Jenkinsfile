pipeline {
    agent any

    environment {
        VERSION = "${BUILD_NUMBER}"
        FRONTEND_IMAGE = "ragu162004/client-app"
        BACKEND_IMAGE = "ragu162004/server-app"
        DOCKER_CREDENTIALS_ID = 'docker_cred'
        GIT_CREDENTIALS_ID = 'github_cred'               // Jenkins credential ID for GitHub PAT (username+token)
        GIT_REPO_URL = 'https://github.com/Ragu162004/KN-Stores.git'

        RAGU_GITHUB_USERNAME = 'Ragu162004'             // Your GitHub username
        RAGU_GITHUB_PAT = credentials('RAGU_GITHUB_PAT') // Secret text credential ID for PAT token
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo "📥 Cloning repository via HTTPS using PAT..."
                git branch: 'main', credentialsId: "${GIT_CREDENTIALS_ID}", url: "${GIT_REPO_URL}"
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

                    // Configure git user
                    sh """
                        git config user.email "ragu16102004@gmail.com"
                        git config user.name "Ragu162004"
                    """

                    // Create tag locally
                    sh "git tag v${VERSION}"

                    // Push tag using HTTPS with injected credentials securely
                    sh """
                        git push https://${RAGU_GITHUB_USERNAME}:${RAGU_GITHUB_PAT}@github.com/Ragu162004/KN-Stores.git v${VERSION}
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
