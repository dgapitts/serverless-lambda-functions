 aws iam put-role-policy \
        --role-name lambda-pizzas-executor \
        --policy-name PizzaApiDynamoDB \
        --policy-document file://./roles/dynamodb.json
