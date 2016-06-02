import Lighthouse from '../dist/lighthouse.umd';


describe('loading lighthouse', () => {
  const lighthouse = new Lighthouse('test');
  it('track event', (done) => {
    // create user
    lighthouse.track('sample_event');
    done();
  });
});
