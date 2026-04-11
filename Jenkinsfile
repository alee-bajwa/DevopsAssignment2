pipeline {
    agent any
    stages {
        stage('Fetch Code') {
            steps {
                // This step automatically uses the Repository URL 
                // and Credentials configured in the job settings
                checkout scm 
            }
        }
        stage('Deploy Part 2') {
            steps {
                script {
                    // This command runs inside the folder where Jenkins downloaded the code
                    sh 'docker-compose -f docker-compose-pipeline.yml down || true'
                    sh 'docker-compose -f docker-compose-pipeline.yml up -d'
                }
            }
        }
    }
}
