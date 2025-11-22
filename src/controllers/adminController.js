export const getAdmins = (req, res) => {
  res.json({ message: "Admin list loaded successfully" });
};

export const createAdmin = (req, res) => {
  res.json({ message: "Admin created successfully" });
};

export const loginAdmin = (req, res) => {
  res.json({ message: "Admin login endpoint working" });
};
