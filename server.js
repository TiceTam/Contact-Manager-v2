if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const ejs = require('ejs')
const path = require('path')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/index', (req, res) => {
  res.render('index.ejs')
})

app.get('/login_page', checkNotAuthenticated, (req, res) => {
  res.render('login_page.ejs')
})

app.post('/login_page', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/contacts',
  failureRedirect: '/login_page',
  failureFlash: true
}))

app.get('/sign_up', checkNotAuthenticated, (req, res) => {
  res.render('sign_up.ejs')
})

app.post('/sign_up', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login_page')
  } catch {
    res.redirect('/sign_up')
  }
  console.log(users)
})

app.get('/contacts', checkAuthenticated, (req, res) => {
  res.render('contacts.ejs')
})

app.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/login_page')
  })
})


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login_page')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/contacts')
  }

  next()
}

app.listen(3000)
