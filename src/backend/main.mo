import Int "mo:core/Int";
import Array "mo:core/Array";
import Time "mo:core/Time";

actor {
  type EmailTemplate = {
    id : Nat;
    name : Text;
    subject : Text;
    body : Text;
    variables : [Text];
    createdAt : Int;
    updatedAt : Int;
    isActive : Bool;
  };

  type EmailHistory = {
    id : Nat;
    recruiterName : Text;
    recruiterEmail : Text;
    company : Text;
    jobTitle : Text;
    templateId : Nat;
    subject : Text;
    status : EmailStatus;
    sentAt : Int;
    openedAt : ?Int;
    repliedAt : ?Int;
  };

  type EmailStatus = {
    #sent;
    #failed;
    #pending;
  };

  type SmtpConfig = {
    host : Text;
    port : Nat;
    email : Text;
    password : Text;
    encryptionType : Text;
    fromName : Text;
    replyTo : Text;
    isConnected : Bool;
  };

  type Resume = {
    id : Nat;
    name : Text;
    isDefault : Bool;
    uploadedAt : Int;
  };

  var smtpConfig : ?SmtpConfig = null;

  var templateIdCounter = 0;
  var historyIdCounter = 0;
  var resumeIdCounter = 0;

  var emailTemplates : [EmailTemplate] = [];
  var emailHistories : [EmailHistory] = [];
  var resumes : [Resume] = [];

  public shared ({ caller }) func createEmailTemplate(name : Text, subject : Text, body : Text, variables : [Text]) : async EmailTemplate {
    templateIdCounter += 1;
    let newTemplate : EmailTemplate = {
      id = templateIdCounter;
      name;
      subject;
      body;
      variables;
      createdAt = Time.now();
      updatedAt = Time.now();
      isActive = true;
    };
    emailTemplates := emailTemplates.concat([newTemplate]);
    newTemplate;
  };

  public query ({ caller }) func getEmailTemplate(id : Nat) : async ?EmailTemplate {
    emailTemplates.find(func(t) { t.id == id });
  };

  public query ({ caller }) func getAllEmailTemplates() : async [EmailTemplate] {
    emailTemplates;
  };

  public shared ({ caller }) func updateEmailTemplate(id : Nat, subject : Text, body : Text, variables : [Text]) : async ?EmailTemplate {
    var found = false;
    emailTemplates := emailTemplates.map(
      func(tpl) {
        if (tpl.id == id) {
          found := true;
          {
            tpl with
            subject;
            body;
            variables;
            updatedAt = Time.now();
          };
        } else {
          tpl;
        };
      }
    );
    if (not found) { return null };
    emailTemplates.find(func(t) { t.id == id });
  };

  public shared ({ caller }) func deleteEmailTemplate(id : Nat) : async Bool {
    let originalSize = emailTemplates.size();
    emailTemplates := emailTemplates.filter(func(tpl) { tpl.id != id });
    let newSize = emailTemplates.size();
    originalSize > newSize;
  };

  public shared ({ caller }) func createEmailHistory(record : EmailHistory) : async EmailHistory {
    historyIdCounter += 1;
    let newRecord = {
      record with
      id = historyIdCounter;
      sentAt = Time.now();
    };
    emailHistories := emailHistories.concat([newRecord]);
    newRecord;
  };

  public query ({ caller }) func getAllEmailHistory() : async [EmailHistory] {
    emailHistories;
  };

  public shared ({ caller }) func deleteEmailHistory(id : Nat) : async Bool {
    let originalSize = emailHistories.size();
    emailHistories := emailHistories.filter(func(hist) { hist.id != id });
    let newSize = emailHistories.size();
    originalSize > newSize;
  };

  public shared ({ caller }) func markEmailHistoryPending(id : Nat) : async ?EmailHistory {
    var found = false;
    emailHistories := emailHistories.map(
      func(hist) {
        if (hist.id == id) {
          found := true;
          { hist with status = #pending };
        } else {
          hist;
        };
      }
    );
    if (not found) { return null };
    emailHistories.find(func(hist) { hist.id == id });
  };

  public shared ({ caller }) func setSmtpConfig(config : SmtpConfig) : async () {
    smtpConfig := ?config;
  };

  public query ({ caller }) func getSmtpConfig() : async ?SmtpConfig {
    smtpConfig;
  };

  public shared ({ caller }) func createResume(name : Text, isDefault : Bool) : async Resume {
    resumeIdCounter += 1;
    let newResume : Resume = {
      id = resumeIdCounter;
      name;
      isDefault;
      uploadedAt = Time.now();
    };

    resumes := resumes.concat([newResume]);
    newResume;
  };

  public query ({ caller }) func getAllResumes() : async [Resume] {
    resumes;
  };

  public shared ({ caller }) func deleteResume(id : Nat) : async Bool {
    let originalSize = resumes.size();
    resumes := resumes.filter(func(resume) { resume.id != id });
    let newSize = resumes.size();
    originalSize > newSize;
  };

  public shared ({ caller }) func markDefaultResume(id : Nat) : async ?Resume {
    var found = false;
    resumes := resumes.map(
      func(resume) {
        if (resume.id == id) {
          found := true;
          { resume with isDefault = true };
        } else {
          { resume with isDefault = false };
        };
      }
    );
    if (not found) { return null };
    resumes.find(func(resume) { resume.id == id });
  };

  public shared ({ caller }) func seedData() : async () {
    // Seed Email Templates
    ignore await createEmailTemplate("Product Manager", "Subject 1", "Dear {RECRUITER_NAME} - {COMPANY}", ["RECRUITER_NAME", "COMPANY"]);
    ignore await createEmailTemplate("Software Engineer", "Subject 2", "Dear {RECRUITER_NAME} - {COMPANY}", ["RECRUITER_NAME", "COMPANY"]);
    ignore await createEmailTemplate("Senior Dev", "Subject 3", "Dear {RECRUITER_NAME} - {COMPANY}", ["RECRUITER_NAME", "COMPANY"]);

    // Seed Email History
    for (_ in Array.repeat(0, 10).values()) {
      ignore await createEmailHistory({
        id = 0;
        recruiterName = "John Doe";
        recruiterEmail = "john@example.com";
        company = "Acme Inc";
        jobTitle = "Backend Engineer";
        templateId = 1;
        subject = "Application for {jobTitle}";
        status = #sent;
        sentAt = 0;
        openedAt = null;
        repliedAt = null;
      });
    };

    // Seed Resumes
    ignore await createResume("John Doe Resume", true);
    ignore await createResume("John Doe CV", false);
    ignore await createResume("Jane Doe Resume", false);

    // Seed SMTP Config
    ignore await setSmtpConfig({
      host = "smtp.mail.com";
      port = 587;
      email = "noreply@mail.com";
      password = "password123";
      encryptionType = "TLS";
      fromName = "Recruit Mail AI";
      replyTo = "noreply@mail.com";
      isConnected = true;
    });
  };
};
