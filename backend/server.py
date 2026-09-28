from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, field_validator
from typing import List, Optional, Annotated
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        return self.model_dump(by_alias=True, exclude={"id"})


class Score(BaseDocument):
    name: str
    score: int
    wave: int
    kills: int = 0
    created_at: str


class ScoreCreate(BaseModel):
    name: str = Field(min_length=1, max_length=16)
    score: int = Field(ge=0, le=10_000_000)
    wave: int = Field(ge=0, le=100_000)
    kills: int = Field(default=0, ge=0, le=1_000_000)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name required")
        return v


class ScoreOut(BaseModel):
    id: str
    name: str
    score: int
    wave: int
    kills: int
    created_at: str
    rank: Optional[int] = None


def to_out(s: Score, rank: Optional[int] = None) -> ScoreOut:
    return ScoreOut(id=s.id, name=s.name, score=s.score, wave=s.wave, kills=s.kills, created_at=s.created_at, rank=rank)


@api_router.get("/")
async def root():
    return {"message": "Cat Versus Ghost API"}


@api_router.post("/scores", response_model=ScoreOut)
async def create_score(payload: ScoreCreate):
    score = Score(**payload.model_dump(), created_at=datetime.now(timezone.utc).isoformat())
    res = await db.scores.insert_one(score.to_mongo())
    score.id = str(res.inserted_id)
    rank = await db.scores.count_documents({"score": {"$gt": score.score}}) + 1
    return to_out(score, rank)


@api_router.get("/scores", response_model=List[ScoreOut])
async def list_scores(limit: int = Query(20, ge=1, le=100)):
    docs = await db.scores.find().sort([("score", -1), ("created_at", 1)]).limit(limit).to_list(limit)
    return [to_out(Score.from_mongo(d), i + 1) for i, d in enumerate(docs)]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
