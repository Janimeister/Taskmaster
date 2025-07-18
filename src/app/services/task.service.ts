import { Injectable, signal, inject } from '@angular/core';
import { Task } from '../models/task.model';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly TASKS_KEY = 'task-checker-tasks';
  private securityService = inject(SecurityService);
  
  private readonly defaultTasks: Task[] = [
    {
      id: '1',
      title: 'Kerro kumpi pärjäisi paremmin zombiapocalypsessä - Veera vai Jani. Perustele',
      description: 'Kerro kumpi pärjäisi paremmin zombiapocalypsessä - Veera vai Jani. Perustele',
      category: 'Synttärijuhlat'
    },
    {
      id: '2',
      title: 'Kerro sankareista hauska/lempi yhteismuisto',
      description: 'Kerro sankareista hauska/lempi yhteismuisto',
      category: 'Synttärijuhlat'
    },
    {
      id: '3',
      title: 'Kirjoita onnitteluruno',
      description: 'Kirjoita onnitteluruno',
      category: 'Synttärijuhlat'
    },
    {
      id: '4',
      title: 'Löydä tonttu Veeran ja Janin kotoa',
      description: 'Löydä tonttu Veeran ja Janin kotoa',
      category: 'Synttärijuhlat'
    },
    {
      id: '5',
      title: 'Voita pöytäfutiksessa',
      description: 'Voita pöytäfutiksessa',
      category: 'Synttärijuhlat'
    },
    {
      id: '6',
      title: 'Taittele lautasliinasta origami',
      description: 'Taittele lautasliinasta origami',
      category: 'Synttärijuhlat'
    },
    {
      id: '7',
      title: 'Suostuttele tuntematon ihminen onnittelemaan sankareita',
      description: 'Suostuttele tuntematon ihminen onnittelemaan sankareita',
      category: 'Synttärijuhlat'
    },
    {
      id: '8',
      title: 'Ota kuva kaikista juhlijoista',
      description: 'Ota kuva kaikista juhlijoista',
      category: 'Synttärijuhlat'
    },
    {
      id: '9',
      title: 'Soita sankareiden lemibiisi ja tanssi',
      description: 'Soita sankareiden lemibiisi ja tanssi',
      category: 'Synttärijuhlat'
    },
    {
      id: '10',
      title: 'Piirrä muotokuva yhdestä sankareista',
      description: 'Piirrä muotokuva yhdestä sankareista',
      category: 'Synttärijuhlat'
    },
    {
      id: '11',
      title: 'Pikkujekku',
      description: 'Pikkujekku',
      category: 'Synttärijuhlat'
    },
    {
      id: '12',
      title: 'Kommentoi toisten sanomiin asioihin "voi pojat".',
      description: 'Kommentoi toisten sanomiin asioihin "voi pojat".',
      category: 'Synttärijuhlat'
    },
    {
      id: '13',
      title: 'Kerro yksi hauska fakta itsestäsi jollekin, joka ei sitä tiedä',
      description: 'Kerro yksi hauska fakta itsestäsi jollekin, joka ei sitä tiedä',
      category: 'Synttärijuhlat'
    },
    {
      id: '14',
      title: 'Selvitä kolmelta vieraalta, mitkä ovat heidän lempi Disney-elokuvansa / Pokemoninsa',
      description: 'Selvitä kolmelta vieraalta, mitkä ovat heidän lempi Disney-elokuvansa / Pokemoninsa',
      category: 'Synttärijuhlat'
    },
    {
      id: '15',
      title: 'Esitä tunnettu mainos tai elokuvarepliikki',
      description: 'Esitä tunnettu mainos tai elokuvarepliikki',
      category: 'Synttärijuhlat'
    },
    {
      id: '16',
      title: 'Etsi vieras, jolla on sama kengännumero kuin sinulla',
      description: 'Etsi vieras, jolla on sama kengännumero kuin sinulla',
      category: 'Synttärijuhlat'
    },
    {
      id: '17',
      title: 'Etsi kaksi muuta, joilla on synttärit samana kuukautena kuin sinulla.',
      description: 'Etsi kaksi muuta, joilla on synttärit samana kuukautena kuin sinulla.',
      category: 'Synttärijuhlat'
    },
    {
      id: '18',
      title: 'Selvitä Uuden Saunan omistajan etunimi (ilman googlea)',
      description: 'Selvitä Uuden Saunan omistajan etunimi (ilman googlea)',
      category: 'Synttärijuhlat'
    },
    {
      id: '19',
      title: 'Ota salaselfie vieruskaverin kanssa (siten ettei hän huomaa)',
      description: 'Ota salaselfie vieruskaverin kanssa (siten ettei hän huomaa)',
      category: 'Synttärijuhlat'
    },
    {
      id: '20',
      title: 'Muistele milloin tapasit sankarit ensimmäisen kerran ja millainen kohtaaminen oli',
      description: 'Muistele milloin tapasit sankarit ensimmäisen kerran ja millainen kohtaaminen oli',
      category: 'Synttärijuhlat'
    },
    {
      id: '21',
      title: 'Jaa paras neuvo 30:selle',
      description: 'Jaa paras neuvo 30:selle',
      category: 'Synttärijuhlat'
    },
    {
      id: '22',
      title: 'Laula onnittelulaulu sankareille julkisella paikalla',
      description: 'Laula onnittelulaulu sankareille julkisella paikalla',
      category: 'Synttärijuhlat'
    },
    {
      id: '23',
      title: 'Ryömi pöydän ali',
      description: 'Ryömi pöydän ali',
      category: 'Synttärijuhlat'
    },
    {
      id: '24',
      title: 'Lennätä paperilennokkia vähintään 5 metriä',
      description: 'Lennätä paperilennokkia vähintään 5 metriä',
      category: 'Synttärijuhlat'
    },
    {
      id: '25',
      title: 'Nimeä oikein kaikki talon viherkasvit',
      description: 'Nimeä oikein kaikki talon viherkasvit',
      category: 'Synttärijuhlat'
    },
    {
      id: '26',
      title: 'Kerro vitsi, joka saa koko saunaporukan nauramaan',
      description: 'Kerro vitsi, joka saa koko saunaporukan nauramaan',
      category: 'Synttärijuhlat'
    },
    {
      id: '27',
      title: 'Välivesi',
      description: 'Välivesi',
      category: 'Synttärijuhlat'
    },
    {
      id: '28',
      title: 'Käy viilentävässä vesikylvyssä saunan jälkeen',
      description: 'Käy viilentävässä vesikylvyssä saunan jälkeen',
      category: 'Synttärijuhlat'
    },
    {
      id: '29',
      title: 'Ole viimeinen synttäriporukasta, joka poistuu lauteilta (sillä hetkellä)',
      description: 'Ole viimeinen synttäriporukasta, joka poistuu lauteilta (sillä hetkellä)',
      category: 'Synttärijuhlat'
    },
    {
      id: '30',
      title: 'Kehu kaveria',
      description: 'Kehu kaveria',
      category: 'Synttärijuhlat'
    }
  ];

  private tasksSignal = signal<Task[]>([]);

  constructor() {
    this.loadTasks();
  }

  get tasks() {
    return this.tasksSignal.asReadonly();
  }

  private loadTasks(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const defaultTasks = this.defaultTasks;
      const storedTasks = this.securityService.safeLocalStorageGet(this.TASKS_KEY, defaultTasks);
      
      // Validate stored tasks
      if (Array.isArray(storedTasks)) {
        const validatedTasks = storedTasks.filter(task => 
          task && 
          typeof task.id === 'string' && 
          typeof task.title === 'string' && 
          typeof task.description === 'string' &&
          typeof task.category === 'string' &&
          this.securityService.validateTaskTitle(task.title)
        );
        
        if (validatedTasks.length === storedTasks.length) {
          this.tasksSignal.set(validatedTasks);
        } else {
          console.warn('Some stored tasks were invalid, using defaults');
          this.tasksSignal.set(defaultTasks);
          this.saveTasks();
        }
      } else {
        this.tasksSignal.set(defaultTasks);
        this.saveTasks();
      }
    } else {
      // Server-side rendering - use default tasks
      this.tasksSignal.set(this.defaultTasks);
    }
  }

  private saveTasks(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const success = this.securityService.safeLocalStorageSet(this.TASKS_KEY, this.tasksSignal());
      if (!success) {
        console.error('Failed to save tasks - data may be too large');
      }
    }
  }

  /**
   * Reset all tasks to their default uncompleted state
   */
  resetAllTasks(): void {
    console.log('TaskService: Resetting all tasks to default state');
    
    // Reset all tasks to incomplete
    const resetTasks = this.defaultTasks.map(task => ({ ...task }));
    this.tasksSignal.set(resetTasks);
    
    // Save the reset state
    this.saveTasks();
    
    console.log('TaskService: All tasks reset to default incomplete state');
  }

  addTask(task: Omit<Task, 'id'>): void {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    
    const currentTasks = this.tasksSignal();
    this.tasksSignal.set([...currentTasks, newTask]);
    this.saveTasks();
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const currentTasks = this.tasksSignal();
    const updatedTasks = currentTasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    this.tasksSignal.set(updatedTasks);
    this.saveTasks();
  }

  deleteTask(id: string): void {
    const currentTasks = this.tasksSignal();
    const filteredTasks = currentTasks.filter(task => task.id !== id);
    this.tasksSignal.set(filteredTasks);
    this.saveTasks();
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSignal().find(task => task.id === id);
  }

  getTasksByCategory(category: string): Task[] {
    return this.tasksSignal().filter(task => task.category === category);
  }

  getAllCategories(): string[] {
    const categories = this.tasksSignal().map(task => task.category);
    return [...new Set(categories)].sort();
  }
}
