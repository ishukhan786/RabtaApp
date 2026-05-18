FROM python:3.10-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . /code

# Ensure write permissions for SQLite database in Hugging Face environment
RUN mkdir -p /code/data && chmod 777 /code/data
ENV DATABASE_URL=sqlite:///./data/rabta_live.db

# Hugging Face Spaces Docker SDK exposes port 7860 by default
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
