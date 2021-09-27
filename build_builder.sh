docker build -t psnextv1-builder .
docker tag psnextv1-builder gcr.io/$PROJECT_ID/psnextv1-builder
docker push gcr.io/$PROJECT_ID/psnextv1-builder
