const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Read one
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res.status(200).json({
      status: true,
      user: {
            _id: user._id,

        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateUser = async (req, res) => {
  try{
 const {name, age} = req.body;
  if(!name || !age){
    return res.status(400).json({message: 'Name & age are required'})
  }
  const user = await User.findByIdAndUpdate(req.params.id, {name,age}, {new: true});
  if(!user){
    return res.status(404).json({status: false, message: "User not found"});
  }
  return res.status(200).json({status:true, user:{
    _id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    age: user.age,
  }})
  }catch(err){
    return res.status(500).json({message: err.message});
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try{
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
      return res.status(404).json({status:false, message: "User not found"});
    }
    return res.status(200).json({status:true, message:"User deleted successfully"});
  }catch(err){
    res.status(500).json({message:err.message});
  }

};

exports.changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }

    // Added await here - was missing
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Added await here - was missing
    const checkOldPwd = await bcrypt.compare(oldPassword, user.password);
    if (!checkOldPwd) {
      return res.status(400).json({ status: false, message: 'Old password does not match' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ 
      status: true, 
      message: 'Password updated successfully' 
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
