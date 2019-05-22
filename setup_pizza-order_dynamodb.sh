aws dynamodb create-table --table-name pizza-orders \
   --attribute-definitions AttributeName=orderId,AttributeType=S \
   --key-schema AttributeName=orderId,KeyType=HASH \
   --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
   --region eu-west-1 \
   --query TableDescription.TableArn --output text

aws dynamodb describe-table --table-name pizza-orders  --region eu-west-1
