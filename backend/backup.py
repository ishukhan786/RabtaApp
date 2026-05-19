import os
import logging
import threading
import time
from huggingface_hub import HfApi, create_repo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backup")

DB_FILE = "rabta_live.db"
SPACE_ID = os.getenv("SPACE_ID") # Format: username/space-name
# Check both HF_TOKEN and write tokens
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HF_API_TOKEN")

# Determine dataset repo ID for backup
if SPACE_ID:
    owner = SPACE_ID.split("/")[0]
    DATASET_REPO = f"{owner}/rabta-db-backup"
else:
    DATASET_REPO = None

def get_api():
    if not HF_TOKEN or not DATASET_REPO:
        logger.info("HF_TOKEN or SPACE_ID environment variables are not set. Auto-backup disabled.")
        return None
    return HfApi(token=HF_TOKEN)

def download_db():
    api = get_api()
    if not api:
        return False
    try:
        logger.info(f"Checking for existing DB backup in dataset: {DATASET_REPO}")
        try:
            api.repo_info(repo_id=DATASET_REPO, repo_type="dataset")
        except Exception:
            logger.info("Backup dataset does not exist yet. It will be created on the first upload.")
            return False

        logger.info("Downloading rabta_live.db from Hugging Face Dataset...")
        api.hf_hub_download(
            repo_id=DATASET_REPO,
            filename=DB_FILE,
            repo_type="dataset",
            local_dir=".",
            local_dir_use_symlinks=False
        )
        logger.info("rabta_live.db downloaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error downloading DB: {e}")
        return False

def upload_db():
    api = get_api()
    if not api:
        return False
    if not os.path.exists(DB_FILE):
        logger.warning(f"Local file {DB_FILE} not found. Cannot upload.")
        return False
    try:
        # Create dataset repo if it doesn't exist
        try:
            api.repo_info(repo_id=DATASET_REPO, repo_type="dataset")
        except Exception:
            logger.info(f"Creating private backup dataset: {DATASET_REPO}...")
            create_repo(repo_id=DATASET_REPO, repo_type="dataset", private=True, token=HF_TOKEN)

        logger.info("Uploading rabta_live.db to Hugging Face Dataset...")
        api.upload_file(
            path_or_fileobj=DB_FILE,
            path_in_repo=DB_FILE,
            repo_id=DATASET_REPO,
            repo_type="dataset"
        )
        logger.info("rabta_live.db uploaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error uploading DB: {e}")
        return False

# Thread-safe async backup trigger with debounce
backup_lock = threading.Lock()
_pending_backup = False

def _do_backup_with_debounce():
    global _pending_backup
    time.sleep(2) # Wait 2 seconds for writes to settle
    with backup_lock:
        _pending_backup = False
        upload_db()

def trigger_backup():
    global _pending_backup
    # If using local SQLite, trigger the async upload
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rabta_live.db")
    if not DATABASE_URL.startswith("sqlite"):
        return
    
    if not _pending_backup:
        _pending_backup = True
        t = threading.Thread(target=_do_backup_with_debounce)
        t.daemon = True
        t.start()
