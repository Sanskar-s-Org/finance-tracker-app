pipeline {
    agent any

    options {
        timestamps()
    }

    tools {
        nodejs 'nodejs-22-6-0'
    }

    stages {
        stage('Build and Install Dependencies') {
            parallel {

                stage('Backend Dependencies') {
                    agent {
                        node {
                            label ''
                            customWorkspace "${env.WORKSPACE}@backend"
                        }
                    }
                    steps {
                        checkout scm
                        dir('backend') {
                            sh '''
                                echo "📦 Installing backend dependencies..."
                                npm config set cache .npm-cache --global
                                npm ci --no-audit --no-fund
                            '''
                        }
                    }
                }

                stage('Frontend Dependencies') {
                    agent {
                        node {
                            label ''
                            customWorkspace "${env.WORKSPACE}@frontend"
                        }
                    }
                    steps {
                        checkout scm
                        dir('frontend') {
                            sh '''
                                echo "📦 Installing frontend dependencies..."
                                npm config set cache .npm-cache --global
                                npm ci --no-audit --no-fund
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Dependency installation completed successfully"
        }
        failure {
            echo "❌ Dependency installation failed"
        }
    }
}
