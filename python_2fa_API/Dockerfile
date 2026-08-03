# Step 1: Use an official lightweight Python base image
FROM python:3.11-slim

# Step 2: Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Step 3: Set working directory in container
WORKDIR /app

# Step 4: Install system dependencies required for build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Step 5: Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy application code into container
COPY . .

# Step 7: Create uploads directory if not present
RUN mkdir -p uploads

# Step 8: Expose the Flask port
EXPOSE 8090

# Step 9: Define default command to run the application
CMD ["python", "server_xorkeesign.py"]
