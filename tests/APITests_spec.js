var frisby = require('frisby');
frisby.create('Get list of divesites')
  .get('http://localhost:3000/divesites')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('*', {
    name: String,
    loc: Object,
    updated_at: Object,
    chart_depth: Object
  })
.toss();