const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    phone: {
        type: Number,
    },

    role: {
        type: String,
        default: "admin",
    },
    isBlocked: {
        type: Boolean,
    },
},
{
    timestamps: true,
}
);


AdminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  module.exports = mongoose.model("Admin", AdminSchema);