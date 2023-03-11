const express = require("express");
const Router = express.Router();
const passport = require("./passport");
const { Auth } = require("../middleware");

Router.get("/", async (req, res, next) => {
    res.status(200).json({success: true});
})

Router.get("/user", Auth, async (req, res, next) => {
    res.status(200).json({success: true, data: req.user});
})

Router.get("/logout", Auth, async (req, res, next) => {
    req.logout((e) => {
        if(e) return console.error(e);
        res.status(200).json({success: true});
    })
    
})
Router.get("/auth/discord", passport.authenticate('discord'));
Router.get("/auth/discord/callback", passport.authenticate('discord', { failureRedirect: "/" }), async (req, res, next) => {
    if(!req.user) return res.status(401).json({success: false, error: "Unauthorized"});
    res.status(200).json({success: true, data: req.user});
})

module.exports = Router;