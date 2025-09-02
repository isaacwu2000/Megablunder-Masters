from firebase_functions import https_fn, options
from firebase_admin import firestore, initialize_app
from math import e

"""
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
"""

app = initialize_app()
db = firestore.client()

@https_fn.on_call()
def get_problem(req: https_fn.CallableRequest):
    if req.auth is None:
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION, message="The function must be called while authenticated.")

    # Get the user's elo from their uid
    uid = req.auth.uid
    user = db.collection("users").document(uid).get().to_dict()
    user_elo = user["elo"]

    # Query for problems of 'category' and of ideal elo for learning
    category = req.data["category"]

    if category:
        query = (
            db.collection("problems")
            .where("category", "==", category)
            .where("elo", ">=", user_elo-65)
            .where("elo", "<=", user_elo-32)
            .order_by("elo", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        if not len(query.get()):
            query = (
                db.collection("problems")
                .where("category", "==", category)
                .where("elo", ">=", user_elo-65)
                .limit(1)
            )
            if not len(query.get()):
                query = (
                    db.collection("problems")
                    .where("category", "==", category)
                    .limit(1)
                )
                if not len(query.get()):
                    query = (
                        db.collection("problems")
                        .limit(1)
                    )
    else:
        query = (
            db.collection("problems")
            .where("elo", ">=", user_elo-65)
            .where("elo", "<=", user_elo-32)
            .order_by("elo", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        if not len(query.get()):
            query = (
                db.collection("problems")
                .where("elo", ">=", user_elo-65)
                .limit(1)
            )
            if not len(query.get()):
                query = (
                    db.collection("problems")
                    .limit(1)
                )

    # Get and return the optimal problem as a dict
    print("query:",query)
    print("query get:",query.get())
    print(len(query.get()))
    problem_doc = query.get()[0]
    problem_info: dict = problem_doc.to_dict()
    print({
        "ref": problem_doc.id,
        "problemStatement": problem_info["problemStatement"],
        "solution": problem_info["solution"],
        "answer": problem_info["answer"],
        "elo": problem_info["elo"],
        "category": problem_info["category"]
    })
    return {
        "id": problem_doc.id,
        "problemStatement": problem_info["problemStatement"],
        "solution": problem_info["solution"],
        "answer": problem_info["answer"],
        "elo": problem_info["elo"],
        "category": problem_info["category"]
    }

@https_fn.on_call()
def update_elos(req: https_fn.CallableRequest):
    if req.auth is None:
        raise https_fn.HttpsError(code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION, message="The function must be called while authenticated.")

    # Get relevant info from request and Firestore
    user_answer = req.data["userAnswer"]
    uid = req.auth.uid
    user_ref = db.collection("users").document(uid)
    user_elo = user_ref.get().to_dict()["elo"]
    problem_ref = db.collection("problems").document(req.data["problemId"])
    print("problemId:", req.data["problemId"])
    problem_elo = problem_ref.get().to_dict()["elo"]

    # Calculate elo change based on the Bradley-Terry model
    probability_user_lose = 1 / (1 + e**(-1 * (user_elo - problem_elo) / 30))
    k = 20

    correct: bool = (user_answer == problem_ref.get().to_dict()["answer"])
    if correct:
        r = k * probability_user_lose
        user_elo += r
        problem_elo -= r
    else:
        r = k * (1-probability_user_lose)
        user_elo -= r
        problem_elo += r

    # Update user and problem elos on Firestore
    user_ref.update({"elo": user_elo})
    problem_ref.update({"elo": problem_elo})

    return {"correct": correct}