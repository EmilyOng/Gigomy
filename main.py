from flask import Flask, render_template, redirect, url_for, request, session
from flask_socketio import SocketIO, join_room, leave_room, send, emit
from flask_sqlalchemy import SQLAlchemy
from flask_login import login_required, LoginManager, UserMixin, current_user, login_user, logout_user

from werkzeug.security import generate_password_hash, check_password_hash

import datetime
import json

def getUser (user):
    currentUser = {"username": user.username,
                    "email": user.email,
                    "avatar": user.avatar}
    return currentUser

def processJob (job):
    jobID = job.jobID
    jobTitle = job.jobTitle
    jobDescription = job.jobDescription
    jobLocation = job.jobLocation
    jobPrice = "${:,.2f}".format(job.jobPrice)
    jobDatePosted_ = job.jobDatePosted
    jobDatePosted = (jobDatePosted_.strftime("%Y-%m-%d %H:%M:%S"))

    jobDateStart = job.jobDateStart
    jobDateEnd = job.jobDateEnd
    jobSender = job.jobSender
    jobReceiver = job.jobReceiver
    jobDuration_ = jobDateEnd - jobDateStart
    jobDurationRaw = jobDuration_.total_seconds()

    jobDuration_ = str(jobDuration_).split(",")
    if len(jobDuration_) == 1:
        timing = jobDuration_[0].split(":")
        hours = int(timing[0])
        mins = int(timing[1])
        secs = int(timing[2])
        jobDuration = ((hours != 0) * "{} hours | ".format(hours) +
                        (mins != 0) * "{} minutes | ".format(mins) +
                        (secs != 0) * "{} seconds | ".format(secs))
    else:
        days = jobDuration_[0]
        timing = jobDuration_[1].split(":")
        hours = int(timing[0])
        mins = int(timing[1])
        secs = int(timing[2])
        jobDuration = days + " "
        jobDuration += ((hours != 0) * "{} hours | ".format(hours) +
                        (mins != 0) * "{} minutes | ".format(mins) +
                        (secs != 0) * "{} seconds | ".format(secs))

    job_ = {"jobID": jobID, "jobTitle": jobTitle,
            "jobDescription": jobDescription,
            "jobLocation": jobLocation,
            "jobPrice": jobPrice,
            "jobDatePosted": jobDatePosted,
            "jobDateStart": jobDateStart,
            "jobDateEnd": jobDateEnd,
            "jobSender": jobSender, "jobReceiver": jobReceiver,
            "jobDuration": jobDuration, "jobDurationRaw": jobDurationRaw}
    return job_

def getJobDetails (data):
    title = data["title"]
    description = data["description"]
    location = data["location"]
    price = data["price"]
    dateStart_ = data["dateStart"].split("-")
    dateEnd_ = data["dateEnd"].split("-")

    timeStart = data["timeStart"].split(":")
    timeEnd = data["timeEnd"].split(":")

    dateStart = datetime.datetime(int(dateStart_[0]), int(dateStart_[1]), int(dateStart_[2]),
                            int(timeStart[0]), int(timeStart[1]), 0)
    dateEnd = datetime.datetime(int(dateEnd_[0]), int(dateEnd_[1]), int(dateEnd_[2]),
                            int(timeEnd[0]), int(timeEnd[1]), 0)

    datePosted = datetime.datetime.now()

    job = {"title": title, "description": description, "location": location,
            "price": price, "dateStart": dateStart, "dateEnd": dateEnd, "datePosted": datePosted}
    return job


CONNECTED_USERS = {}

app = Flask(__name__)
app.config["SECRET_KEY"] = "29034d2.3s2;q'435cy6"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Gigomy.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
socketio = SocketIO(app)

db = SQLAlchemy(app)

login = LoginManager(app)
login.login_view = "index"

class User(UserMixin, db.Model):
    username = db.Column(db.String, unique = True, nullable = False, index = True, primary_key = True)
    email = db.Column(db.String, unique = True, index = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    avatar = db.Column(db.String, nullable = True)

    def get_id(self):
        return self.username

class Message(db.Model):
    msgID = db.Column(db.Integer, unique = True, autoincrement = True, nullable = False, index = True, primary_key = True)
    msgText = db.Column(db.String, index = True, nullable = False)
    msgDateTime = db.Column(db.DateTime, nullable = False)
    msgSender = db.Column(db.String, db.ForeignKey("user.username"), nullable = True)
    msgReceiver = db.Column(db.String, db.ForeignKey("user.username"), nullable = True)

class Job(db.Model):
    jobID = db.Column(db.Integer, unique = True, autoincrement = True, nullable = False, index = True, primary_key = True)
    jobTitle = db.Column(db.String, index = True, nullable = False)
    jobDescription = db.Column(db.String, nullable = False)
    jobLocation = db.Column(db.String, nullable = True)
    jobPrice = db.Column(db.Float, index = True, nullable = False)
    jobDatePosted = db.Column(db.DateTime, index = True, nullable = False)
    jobDateStart = db.Column(db.DateTime, index = True, nullable = True)
    jobDateEnd = db.Column(db.DateTime, index = True, nullable = True)
    jobSender = db.Column(db.String, db.ForeignKey("user.username"), nullable = False)
    jobReceiver = db.Column(db.String, db.ForeignKey("user.username"), nullable = True)


@app.errorhandler(Exception)
def handle_error(e):
    return render_template("error.html")


@login.user_loader
def load_user(username):
    return User.query.get(username)


@app.route("/")
def index():
    if current_user.is_authenticated:
        # Get all current jobs
        jobs_ = Job.query.all()
        currentUser = getUser(current_user)
        jobs = []
        for job in jobs_:
            job_ = processJob(job)
            if job_["jobReceiver"]:
                jobs.append(job_)
            else:
                jobs.insert(0, job_)
        return render_template("gigomy.html", jobs=jobs, currentUser=currentUser,
                                currentUser_=json.dumps(currentUser))
    return render_template("index.html")

@app.route("/errorHandling")
def errorHandling():
    try:
        page = session["error"]["page"]
        msg = session["error"]["msg"]
        return render_template(page, msg=json.dumps(msg))
    except:
        return redirect(url_for("index"))

@app.route("/login", methods=["POST"])
def login():
    if not request.form: return redirect(url_for("index"))
    if "login" not in request.form: return redirect(url_for("index"))

    # Get input fields
    email = request.form["email"]
    password = request.form["password"]
    # Check if email exists
    user = User.query.filter_by(email = email).first()
    if user is None:
        # Email does not exist
        session["error"] = {"page": "index.html", "msg": "Email does not exist!"}
        return redirect(url_for("errorHandling"))
    else:
        # Check password
        if check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for("index"))
        else:
            # Password is wrong
            session["error"] = {"page": "index.html", "msg": "Passwords do not match!"}
            return redirect(url_for("errorHandling"))


@app.route ("/chat/<username>", methods=["GET", "POST"])
@app.route ("/chat/", methods=["GET", "POST"])
@login_required
def chat (username=""):
    inChat = len(username) != 0 and username != current_user.username
    currentUser = getUser(current_user)
    if inChat:
        jobSender_ = User.query.filter_by(username = username).first()
        if jobSender_ is None:return redirect(url_for("index"))
        jobSender = getUser(jobSender_)

        # Get messages
        messagesSent = Message.query.filter_by(msgSender = currentUser["username"]).filter_by(msgReceiver = jobSender["username"]).all()
        messagesReceived = Message.query.filter_by(msgReceiver = currentUser["username"]).filter_by(msgSender = jobSender["username"]).all()
        messages_ = []
    else:
        jobSender = None
        # Get messages
        messagesSent = Message.query.filter_by(msgSender = currentUser["username"]).all()
        messagesReceived = Message.query.filter_by(msgReceiver = currentUser["username"]).all()
        messages_ = []

    for message in messagesSent:messages_.append((message.msgDateTime, message))
    for message in messagesReceived:messages_.append((message.msgDateTime, message))
    messages = []
    messages_.sort()
    for message in messages_:messages.append(message[1])
    # Get all contacts
    contacts = set()
    for message in messages:
        if message.msgSender == current_user.username:
            contacts.add(message.msgReceiver)
        if message.msgReceiver == current_user.username:
            contacts.add(message.msgSender)

    contacts = list(contacts)
    return render_template("chat.html", currentUser=currentUser, jobSender=jobSender, jobSender_=json.dumps(jobSender),
                            messages=messages, currentUser_=json.dumps(currentUser), contacts=contacts, inChat=inChat)


@socketio.on("sendPrivateData")
def receivedData (data):
    receiver = data["receiver"]
    message = data["message"]
    sender = current_user.username
    datePosted = datetime.datetime.now()
    print(CONNECTED_USERS, receiver)

    # Add to database
    msg = Message(msgText = message, msgDateTime = datePosted, msgSender = sender, msgReceiver = receiver)
    db.session.add(msg)
    db.session.commit()

    data["datePosted"] = str(datePosted)
    data["sender"] = sender
    if receiver not in CONNECTED_USERS:
        emit("notOnline", "{} is not online!".format(receiver), room=CONNECTED_USERS[sender])
    else:
        print("sending to {}".format(receiver))
        emit("message", data, room=CONNECTED_USERS[receiver])
        print("ok")


@socketio.on("connectUser")
def connectUser ():
    if current_user.is_authenticated:
        CONNECTED_USERS[current_user.username] = request.sid
        print("{} connected!".format(current_user.username))


@app.route("/overview")
@login_required
def overview ():
    # Get all of user's jobs
    jobsSent_ = Job.query.filter_by(jobSender = current_user.username).all()
    jobsReceived_ = Job.query.filter_by(jobReceiver = current_user.username).all()
    jobsSent = []
    for job in jobsSent_:
        job_ = processJob(job)
        jobsSent.append(job_)
    jobsReceived = []
    for job in jobsReceived_:
        job_ = processJob(job)
        jobsReceived.append(job_)
    return render_template("dashboard.html", jobsSent=jobsSent, jobsReceived=jobsReceived)


@app.route("/about")
def about ():
    return render_template("about.html")


@app.route("/takeUpJob/<jobID>")
@login_required
def takeUpJob (jobID):
    job = Job.query.filter_by(jobID = jobID).first()
    if job is None:
        return redirect(url_for("index"))
    job.jobReceiver = current_user.username
    db.session.commit()
    return redirect(url_for("see", id=jobID))


@app.route("/editJob/<jobID>", methods=["POST"])
@login_required
def editJob (jobID):
    if not request.form:return redirect(url_for("index"))
    # if "editJob" not in request.form:return redirect(url_for("index"))
    job = Job.query.filter_by(jobID = int(jobID)).first()
    if job is None or job.jobSender != current_user.username:
        return redirect(url_for("index"))

    job_ = getJobDetails(request.form)
    # jobSender = current_user.username
    job.jobTitle = job_["title"]
    job.jobDescription = job_["description"]
    job.jobLocation = job_["location"]
    job.jobPrice = job_["price"]
    job.jobDatePosted = job_["datePosted"]
    job.jobDateStart = job_["dateStart"]
    job.jobDateEnd = job_["dateEnd"]
    db.session.commit()
    return redirect(url_for("see", id=jobID))


@app.route("/abandonJob/<jobID>")
@login_required
def abandonJob (jobID):
    job = Job.query.filter_by(jobID = jobID).first()
    if job is None or job.jobReceiver != current_user.username:
        return redirect(url_for("index"))
    job.jobReceiver = None
    db.session.commit()
    return redirect(url_for("see", id=jobID))


@app.route ("/see/<id>")
@login_required
def see (id):
    job_ = Job.query.filter_by(jobID = id).first()
    if job_ is None:
        return redirect(url_for("index"))
    else:
        job = processJob(job_)
        currentUser = getUser(current_user)
        jobSender_ = User.query.filter_by(username = job["jobSender"]).first()
        # jobReceiver_ = User.query.filter_by(username = job["jobSender"]).first()
        jobSender = getUser(jobSender_)
        # jobReceiver = getUser(jobReceiver_)
        return render_template("see.html", job=job, currentUser=currentUser,
                                jobSender=jobSender)


@app.route("/signup", methods=["POST"])
def signup():
    if not request.form: return redirect(url_for("index"))
    if "signup" not in request.form: return redirect(url_for("index"))

    email = request.form["email"]
    username = request.form["username"]
    password = request.form["password"]
    confirmPassword = request.form["confirmPassword"]
    if password != confirmPassword:
        #Passwords do not match
        session["error"] = {"page": "index.html", "msg": "Passwords do not match!"}
        return redirect(url_for("errorHandling"))

    # Check if username or email already exists
    if User.query.filter_by(username = username).first() or User.query.filter_by(email = email).first():
        session["error"] = {"page": "index.html", "msg": "Username or email already exists!"}
        return redirect(url_for("errorHandling"))

    passwordHash = generate_password_hash(password, "sha256")
    user = User(username = username, email = email, password = passwordHash, avatar = "")
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return redirect(url_for("index"))


@app.route("/logout")
@login_required
def logout ():
    session.clear()
    CONNECTED_USERS.pop(current_user.username)
    logout_user()
    return redirect(url_for("index"))


@app.route("/addJob", methods=["POST"])
@login_required
def addJob ():
    if not request.form: return redirect(url_for("index"))
    # if "addJob" not in request.form: return redirect(url_for("index"))
    job_ = getJobDetails(request.form)
    jobSender = current_user.username
    job = Job(jobTitle=job_["title"], jobDescription=job_["description"], jobLocation=job_["location"],
            jobPrice=job_["price"], jobDatePosted=job_["datePosted"], jobDateStart=job_["dateStart"],
            jobDateEnd=job_["dateEnd"], jobSender=jobSender)

    db.session.add(job)
    db.session.commit()
    return redirect(url_for("index"))


if __name__ == "__main__":
    # db.create_all()
    socketio.run(app, host="0.0.0.0", debug=True)
