pipeline {
    agent any
    tools {maven 'maven'}
    environment {
        FRONTEND_IMAGE = 'ragu162004/client-app'
        BACKEND_IMAGE = 'ragu162004/server-app'
        DOCKER_CREDENTIALS_ID = 'docker_cred'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Ragu162004/KN-Stores.git'
            }
        } 
        stage('CMD RUN') {
            steps {
                 sh 'mvn clean package'
            }
        } 
        stage('Build Frontend & Backend Images') {
            steps {
                script {
                    docker.build(FRONTEND_IMAGE,'./client')
                    docker.build(BACKEND_IMAGE,'./server')
                }
            }
        }
        stage('Push Images to Docker Hub') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker_cred', toolName: 'docker', url: 'https://index.docker.io/v1/') {
                        docker.image(FRONTEND_IMAGE).push('latest')
                        docker.image(BACKEND_IMAGE).push('latest')
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
            echo '🎉 client and server pushed to Docker Hub!'
        }
        failure {
            echo '❌ Something went wrong with the build or push.'
        }
    }
}
