'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const request = require('superagent-bluebird-promise');

const VOTE_PERIOD = 1000;
const VOTE_LIMIT = 1000;

const REGISTER_URL = 'http://app.getstorybox.com/api/v1.0/social/user';

function vote(uid) {
  return request.
    get(voteUrl(uid)).
    promise();
}

function voteUrl(uid) {
  return `http://app.getstorybox.com/api/v1.0/vote-video/cvd_91b15e00-81f5-44eb-bc7f-fc44128fb656/${uid}/?_=1457021790276`;
}

function register(id) {
  return request.
    post(REGISTER_URL).
    type('form').
    send({
      network: 'Facebook',
      userId: id,
      name: faker.name.findName(),
      gender: 'male'
    }).
    promise();
}

function genVote() {
  const id = Math.floor(Math.random() * 1000000);
  return register(id).then(result => {
    const uid = result.body.user_uid;
    return vote(uid);
  });
}

function main() {
  const promises = [];
  for (let i = 0; i < VOTE_LIMIT; i++) {
    promises.push(genVote());
  }

  let counter = 0;
  Promise.resolve(Promise.map(promises, result => {
    const votes = result.body.numVotes;
    if (votes > VOTE_LIMIT) {
      console.log(`Reached ${votes} votes. Exiting.`);
      process.exit(0);
    }
    console.log(`Voted ${++counter} times this session.`);
    console.log(`Voted ${votes} times total.`);
  }, {
    concurrency: 1
  })).catch(e => {
    console.error(e);
  }).then(() => {
    process.exit(0);
  });
}

main();
