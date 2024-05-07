const jwt = require("jsonwebtoken");

export const validateRegistration = (req: any, res: any, next: any) => {
  if (!req.body.username || req.body.username.length < 3) {
    return res.status(400).send({
      message: "Username must be at least 3 characters.",
    });
  }

  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).send({
      message: "Password must be at least 6 characters.",
    });
  }
  if (req.body.confirmPass !== req.body.password) {
    return res.status(400).send({
      message: "Passwords must match.",
    });
  }
  next();
};

export const validateAdminSession: any = (req: any, res: any, next: any) => {
  if (!req.headers.authorization) {
    return res.status(400).send({
      message: "Invalid Session. Please log in.",
    });
  }
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    const role = req.userData["role"];
    console.log(`parsed data from header: ${role}`);
    if (role == "user") {
      return res.status(400).send({
        message: "You don't have permission to access this page.",
      });
    }
    next();
  } catch (err) {
    return res.status(400).send({
      message: `Error: ${err}`,
    });
  }
};

export const validateSession: any = (req: any, res: any, next: any) => {
  if (!req.headers.authorization) {
    return res.status(400).send({
      message: "Invalid Session. Please log in.",
    });
  }
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (err) {
    return res.status(400).send({
      message: err,
    });
  }
};
