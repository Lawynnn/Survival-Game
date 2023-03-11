const discordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const { User } = require("../database/schema/User");

passport.serializeUser((user, done) => {
    if(!user) return done(new Error("No user found"), null);

    done(null, { accessToken: user.accessToken, refreshToken: user.refreshToken, id: user.id });
})

passport.deserializeUser((id, done) => {
    done(null, id);
})

passport.use(new discordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URI,
    scope: ['identify', 'email']
},
async function(accessToken, refreshToken, profile, cb) {
    const user = await User.findOne({uid: profile.id});
    if(!user) {
        const newUser = new User({
            uid: profile.id,
            accessToken,
            refreshToken,
        });
        await newUser.save();
    }
    else {
        if(user.accessToken !== accessToken) await user.updateOne({accessToken});
        if(user.refreshToken !== refreshToken) await user.updateOne({refreshToken});
    }
    cb(null, {accessToken, refreshToken, ...profile});
}));

module.exports = passport;