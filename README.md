# serverless-lambda-functions
Learn how to use AWS Lambda functions.

## Install
```
npm install
```

## Setup Claudia to work with your AWS
Besides signing up to AWS, you also need to setup keys for Claudia to access your AWS resources.

```
mkdir ~/.aws
touch ~/.aws/credentials
vi ~/.aws/credentials
```

In `credentials` file, write your AWS access key and your AWS secret access key. Note these should never be shared publicly or commited to a repository. The AWS key is generated in the IAM management console, when you login to AWS. If you don't know what your secret access key is, it's best to create a new one, since Amazon will only communicate that key once, when it's created, and won't give it again.

content of  the file `credentials`:
```
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_ACCESS_SECRET
```

## Deploy to AWS the first time
```
rm claudia.json
npm run create
```

Note this will deploy to the EU Ireland datacentre. Edit `package.json` script if you wish to deploy to a different datacentre. A `claudia.json` file will be generated locally: do not commit it to your repository.

The successsful response should mention a "url" for your "api". Append `/pizzas` to it in a browser to get your JSON response.

## Further deployments
```
npm run update
```

## Chapter 3 - setup dynamo db table


```
~/projects/serverless-lambda-functions $ cat setup_pizza-order_dynamoDB.sh
aws dynamodb create-table --table-name pizza-orders \
   --attribute-definitions AttributeName=orderId,AttributeType=S \
   --key-schema AttributeName=orderId,KeyType=HASH \
   --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
   --region eu-west-1 \
   --query TableDescription.TableArn --output text

aws dynamodb describe-table --table-name pizza-orders  --region eu-west-1
```

and running this, the output will be similar to
```
~/projects/serverless-lambda-functions $ bash setup_pizza-order_dynamoDB.sh
arn:aws:dynamodb:eu-west-1:981192392543:table/pizza-orders
{
    "Table": {
        "AttributeDefinitions": [
            {
                "AttributeName": "orderId",
                "AttributeType": "S"
            }
        ],
        "TableName": "pizza-orders",
        "KeySchema": [
            {
                "AttributeName": "orderId",
                "KeyType": "HASH"
            }
        ],
        "TableStatus": "CREATING",
        "CreationDateTime": 1558430353.101,
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:eu-west-1:981192392543:table/pizza-orders",
        "TableId": "a5c72b11-d6be-4988-b0b6-a04afc1e0cbc"
    }
}
```

## todo
- PUT to orders entity is broken and makes every order become null.
- Switch to Typescript.
- Add linting.
- Add unit tests with Jest and test coverage report (istanbul).
- JSDoc documentation.
- Setup working locally.
- In each API response, link to other useful endpoints.
