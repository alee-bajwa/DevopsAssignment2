pipeline {
    agent any
    stages {
        stage('Fetch Code') {
            steps {
                checkout scm
            }
        }
        stage('Deploy Application') {
            steps {
                script {
                    // Brings down any old deployment, then brings it up
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline down || true'
                    sh 'docker-compose -f docker-compose-pipeline.yml -p pipeline up -d'
                    
                    // Give Node.js and React 20 seconds to compile and start serving
                    echo "Waiting for frontend to start..."
                    sh 'sleep 20'
                }
            }
        }
        stage('Run Selenium Tests') {
            steps {
                script {
                    // Build the testing image
                    sh 'docker build -t hakibank-tests -f tests/Dockerfile.test .'
                    
                    // Run the tests. --network pipeline_default attaches it to your app's network
                    sh 'docker run --rm --network pipeline_default hakibank-tests'
                }
            }
        }
    }
    post {
        always {
            // Sends email to you and the instructor (who triggered the push)
            emailext (
                subject: "Jenkins Build ${currentBuild.currentResult}: Haki-Bank Pipeline",
                body: "The Jenkins CI/CD pipeline has finished.\n\nStatus: ${currentBuild.currentResult}\n\nPlease check the Jenkins console output for full details.",
                to: "alihabibbajwa6@gmail.com, qasimalik@gmail.com",
                recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'RequesterRecipientProvider']]
            )
        }
    }
}