/** Jest test for the th_trailheadAssignment_entry component */
import {createElement} from 'lwc';
import trailheadAssignmentEntry from 'c/th_trailheadAssignment_entry';

/*
const exampleData = [{"DueDate":"2019-03-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/lightning-web-components-basics/80a88b1ee88352b7377f12382b3cff17_badge.png","Id":"a062E00001O0dEKQAZ","Name":"Lightning Web Components Basics","NumDaysUntilDue":-11,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/module/lightning-web-components-basics/"},
  {"DueDate":"2019-03-29T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/lwc-build-flexible-apps/1f29f0154683c2e993bfb0fa59271301_badge.png","Id":"a062E00001O0dEAQAZ","Name":"Build a Bear-Tracking App with Lightning Web Components","NumDaysUntilDue":-4,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/lwc-build-flexible-apps/"},
  {"DueDate":"2019-04-01T19:00:00.000Z","EntryType":"TrailMix","Icon":"https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753","Id":"a072E00000XdoXvQAJ","Name":"Funky (January ‘19) - Content Release","NumDaysUntilDue":-1,"URL":"https://developer.salesforce.com/trailhead/users/strailhead/trailmixes/january-2019-content-release"},
  {"DueDate":"2019-04-02T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/set-up-your-lightning-web-components-developer-tools/c3dcf42d860258cf365b5f4ff17bea7d_badge.png","Id":"a062E00001O0dEBQAZ","Name":"Set Up Your Lightning Web Components Developer Tools","NumDaysUntilDue":0,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/set-up-your-lightning-web-components-developer-tools/"},
  {"DueDate":"2019-04-15T19:00:00.000Z","EntryType":"TrailMix","Icon":"https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753","Id":"a072E00000XdoY0QAJ","Name":"Architect Journey: Integration Architecture","NumDaysUntilDue":13,"URL":"https://developer.salesforce.com/trailhead/users/strailhead/trailmixes/architect-integration-architecture"},
  {"DueDate":"2019-04-15T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/lightning-web-components-for-aura-developers/f0e02b3cfdb7f61a455503fa2ced1b27_badge.png","Id":"a062E00001O0dEPQAZ","Name":"Lightning Web Components for Aura Developers","NumDaysUntilDue":13,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/module/lightning-web-components-for-aura-developers/"},
  {"DueDate":"2019-04-18T04:05:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/alexa-development-basics/742be347dcd9dde6f079fd9ee7e7604b_badge.png","Id":"a062E00001O0dE0QAJ","Name":"Alexa Development Basics","NumDaysUntilDue":15,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/module/alexa-development-basics/"},
  {"DueDate":"2019-04-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/quick-start-lightning-web-components/a5b473dc9b5fec5a2aef823b218a35bf_badge.png","Id":"a062E00001O0dEQQAZ","Name":"Quick Start: Lightning Web Components","NumDaysUntilDue":20,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/quick-start-lightning-web-components/"}
];
*/

const DUE_OVERDUE = {"DueDate":"2019-03-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/lightning-web-components-basics/80a88b1ee88352b7377f12382b3cff17_badge.png","Id":"a062E00001O0dEKQAZ","Name":"Lightning Web Components Basics","NumDaysUntilDue":-11,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/module/lightning-web-components-basics/"};
const DUE_TODAY = {"DueDate":"2019-04-02T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/set-up-your-lightning-web-components-developer-tools/c3dcf42d860258cf365b5f4ff17bea7d_badge.png","Id":"a062E00001O0dEBQAZ","Name":"Set Up Your Lightning Web Components Developer Tools","NumDaysUntilDue":0,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/set-up-your-lightning-web-components-developer-tools/"};
const DUE_TOMORROW = {"DueDate":"2019-04-03T19:00:00.000Z","EntryType":"TrailMix","Icon":"https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753","Id":"a072E00000XdoY0QAJ","Name":"Architect Journey: Integration Architecture","NumDaysUntilDue":1,"URL":"https://developer.salesforce.com/trailhead/users/strailhead/trailmixes/architect-integration-architecture"};
const DUE_LATER = {"DueDate":"2019-04-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/quick-start-lightning-web-components/a5b473dc9b5fec5a2aef823b218a35bf_badge.png","Id":"a062E00001O0dEQQAZ","Name":"Quick Start: Lightning Web Components","NumDaysUntilDue":20,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/quick-start-lightning-web-components/"};


// describe('c-th_trailheadAssignment_entry', () => {
  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  //describe('initializes correctly', () => {
    /*
    it('when no assignment entry is provided', () => {
      const element = createElement('th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      document.body.appendChild(element);
      let myElement = element.shadowRoot.querySelector('div');
      expect(myElement).not.toBeNull();

      expect(myElement.assignmentEntry).not.toBe(null);

      expect(myElement.hasDueDate).toBe(false);
    });
    */
    
    it('when an assignment is provided', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_OVERDUE;
      document.body.appendChild(element);
      //let myElement = element.shadowRoot.querySelector('c-th_trailhead-assignment_entry');
      //expect(myElement).not.toBeNull();

      expect(element.assignmentEntry).not.toBe(null);
      expect(element.assignmentEntry.EntryType).toBe('Badge');
    });
    
    it('has a due date when provided', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_OVERDUE;
      element.upcomingEventWindow = 7;
      expect(element.hasDueDate).toBe(true);
    });
    
    it('has overdue status if the assignment is overdue', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_OVERDUE;
      element.upcomingEventWindow = 7;
      expect(element.statusClass).toContain('event-due');
    });
    it('has Due status if the assignment is due today', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_TODAY;
      element.upcomingEventWindow = 7;
      expect(element.statusClass).toContain('event-upcoming');
    });
    it('has upcoming status if the assignment is due tomorrow', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_TOMORROW;
      element.upcomingEventWindow = 7;
      expect(element.statusClass).toContain('event-upcoming');
    });
    it('has upcoming status if the assignment is due later', () => {
      const element = createElement('c-th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      element.assignmentEntry = DUE_LATER;
      element.upcomingEventWindow = 7;
      expect(element.statusClass).toContain('event-standard');
    });
    
  //});
//});