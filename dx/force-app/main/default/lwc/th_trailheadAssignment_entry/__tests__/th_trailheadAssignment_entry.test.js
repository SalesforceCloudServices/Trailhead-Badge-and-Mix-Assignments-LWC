/** Jest test for the th_trailheadAssignment_entry component */
import {createElement} from 'lwc';
import trailheadAssignmentEntry from 'c/th_trailheadAssignment_entry';



const DUE_OVERDUE = {"DueDate":"2019-03-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/modules/lightning-web-components-basics/80a88b1ee88352b7377f12382b3cff17_badge.png","Id":"a062E00001O0dEKQAZ","Name":"Lightning Web Components Basics","NumDaysUntilDue":-11,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/module/lightning-web-components-basics/"};
const DUE_TODAY = {"DueDate":"2019-04-02T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/set-up-your-lightning-web-components-developer-tools/c3dcf42d860258cf365b5f4ff17bea7d_badge.png","Id":"a062E00001O0dEBQAZ","Name":"Set Up Your Lightning Web Components Developer Tools","NumDaysUntilDue":0,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/set-up-your-lightning-web-components-developer-tools/"};
const DUE_TOMORROW = {"DueDate":"2019-04-03T19:00:00.000Z","EntryType":"TrailMix","Icon":"https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753","Id":"a072E00000XdoY0QAJ","Name":"Architect Journey: Integration Architecture","NumDaysUntilDue":1,"URL":"https://developer.salesforce.com/trailhead/users/strailhead/trailmixes/architect-integration-architecture"};
const DUE_LATER = {"DueDate":"2019-04-22T19:00:00.000Z","EntryType":"Badge","Icon":"https://res.cloudinary.com/hy4kyit2a/f_auto,fl_lossy,q_70/learn/projects/quick-start-lightning-web-components/a5b473dc9b5fec5a2aef823b218a35bf_badge.png","Id":"a062E00001O0dEQQAZ","Name":"Quick Start: Lightning Web Components","NumDaysUntilDue":20,"Status":"Assigned","URL":"https://developer.salesforce.com/trailhead/project/quick-start-lightning-web-components/"};


describe('c-th_trailheadAssignment_entry', () => {
  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe('initializes correctly', () => {
    it('when no assignment entry is provided', () => {
      const element = createElement('th_trailhead-assignment_entry', { is:trailheadAssignmentEntry });
      document.body.appendChild(element);
      expect(element).not.toBeNull();

      expect(element.assignmentEntry).not.toBe(null);
      expect(element.hasDueDate).toBe(false);
    });
    
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
    
  });
});