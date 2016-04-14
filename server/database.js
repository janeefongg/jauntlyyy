require('dotenv').config();

var knex = require('knex') ({
  client: 'mysql',
  connection: {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  },
  pool: {
    min: 0,
    max: 7
  }
});

var bookshelf = require('bookshelf')(knex);

knex.schema.createTableIfNotExists('users', function (user) {
  user.increments('id').primary();
  // user.string('FirstName');
  // user.string('LastName');
  // user.string('Username');
  user.string('Email');
}).then(function() {
  console.log('users table created');
});

knex.schema.createTableIfNotExists('events', function (event) {
  event.increments('id').primary();
  event.string('inputTitle');
  // event.integer('Owner_id').references('User_id');
  event.integer('userId').unsigned();
  event.foreign('userId').references('id').inTable('users');
  event.dateTime('datetimeValue');
  event.string('duration');
  event.string('address');
  event.string('imageUrl');
}).then(function() {
  console.log('events table created');
});

knex.schema.createTableIfNotExists('users_events', function(join) {
  join.integer('EventID').unsigned();
  join.integer('UserId').unsigned();
  join.foreign('EventID').references('id').inTable('events');
  join.foreign('UserId').references('id').inTable('users');
}).then(function() {
  console.log('users_events join table created');
});

var db = bookshelf;

var User = {};
User.findUser = function (email) {
  console.log('inside findUser');
  return new Promise (function (resolve) {
    if (resolve) {
      resolve(knex('users').select('*').where({Email: email}));
    }
  })
}

User.addUser = function (email) {
  return new Promise (function(resolve) {
    if (resolve) {
      knex('users').insert({ Email: email }).then(function() {
        resolve(true);
      });
    }
  });
};

var Event = {};
Event.get = function(id) {
  return new Promise(function(resolve) {
    if (resolve) {
      knex('events').where('id', id).then(function(data) {
        resolve(data);
      })
    }
  })
}

Event.delete = function(id) {
  console.log('inside delete ', id);
  return new Promise(function(resolve) {
    if (resolve) {
      console.log('inside resolve promise for delete');
      knex('users_events').where('EventID', id).del()
      .then(function() {
        console.log('inside first then events');
        knex('events').where('id', id).del()
        .then(function() {
          console.log('inside then function');
          resolve(true);
        })
      })
    }
  })
}

Event.join = function (eventID, userId) {
  return new Promise(function(resolve) {
    if (resolve) {
      knex('users_events').insert({ eventID: eventID, userId: userId})
      .then(function(data) {
        resolve(data);
      })
    }
  })
}

Event.getJoint = function (userId) {
  return new Promise(function(resolve) {
    if (resolve) {
      knex('users_events').select('EventID').where({userId: userId}).then(function(data) {
        resolve(data);
      })
      // knex('users_events').select('*').where({ userId: userId})
      // .then(function(data) {
      //   resolve(data);
      // })
    }
  })
}

var Unjoin = {};

Unjoin.get = function(id) {
  return new Promise(function(resolve) {
    if (resolve) {
      knex('users_events').where('EventID', id).then(function(data) {
        resolve(data);
      })
    }
  })
}

Unjoin.delete = function(id) {
  console.log('inside delete ', id);
  return new Promise(function(resolve) {
    if (resolve) {
      console.log('inside resolve promise for delete');
      knex('users_events').where('EventID', id).del()
        .then(function() {
          console.log('inside then function');
          resolve(true);
        })
      }
    })
}

module.exports = {
  db: db,
  knex: knex,
  User: User,
  Event: Event,
  Unjoin: Unjoin
};
