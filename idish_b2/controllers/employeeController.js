const Employee = require("../models/EmployeeModel");

// 🔵 Hodim yaratish
exports.createEmployee = async (req, res) => {
  try {
    const { name, lastname, position, salary_amount, salary_type } = req.body;

    // Yangi hodimni yaratish
    const newEmployee = await Employee.create({
      name,
      lastname,
      position,
      salary_amount,
      salary_type,
    });

    res.status(201).json(newEmployee);
  } catch (err) {
    console.error("Hodim yaratishda xatolik:", err.message);
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟢 Barcha hodimlarni olish
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟡 Bitta hodimni olish
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟠 Hodimni yangilash
exports.updateEmployee = async (req, res) => {
  try {
    const { name, lastname, position, salary_amount, salary_type } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }

    employee.name = name || employee.name;
    employee.lastname = lastname || employee.lastname;
    employee.position = position || employee.position;
    employee.salary_amount = salary_amount ?? employee.salary_amount;
    employee.salary_type = salary_type || employee.salary_type;

    const updated = await employee.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🔴 Hodimni o‘chirish
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }

    await employee.remove();
    res.json({ message: "Hodim o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};
