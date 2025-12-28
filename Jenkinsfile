pipeline {
    agent any
    
    tools {
        nodejs 'nodejs-22-6-0'
    }
    stages {
        stage('Build and Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh '''
                                echo "📦 Installing backend dependencies..."
                                npm ci
                            '''
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "📦 Installing frontend dependencies..."
                                npm ci
                            '''
                        }
                    }
                }
            }
        }
    }
}