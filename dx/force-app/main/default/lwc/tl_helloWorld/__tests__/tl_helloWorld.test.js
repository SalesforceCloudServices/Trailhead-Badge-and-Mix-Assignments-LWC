import Hello from 'c/tl_helloWorld';

describe('c-helloWorld', () => {

  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('says hello', () => {
    const helloInstance = new Hello();
    const message = helloInstance.sayHello();
    expect(message).toBe('Hello');
  });
});
