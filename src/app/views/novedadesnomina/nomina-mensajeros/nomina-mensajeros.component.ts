import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HandlerAppService } from '../../../services/handler-app.service';
import { WebApiService } from '../../../services/web-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-nomina-mensajeros',
  templateUrl: './nomina-mensajeros.component.html',
  styleUrls: ['./nomina-mensajeros.component.css']
})
export class NominaMensajerosComponent implements OnInit {

  endpoint: string = '/nomina-mensajeros';
  component = "/nomi/mensajeros";

  selectedTab: string = 'agencies'; 
  loading: boolean = false;
  permissions: any = null;

  showFilter = false;
  fromDate: string = '';
  toDate: string = '';

  selectedType: string = "massive"; 
  selectedAgenciesEcommerce: number[] = [];
  selectedAgencies: any[] = [];

  agencies: any[] =[];
  agenciesEcommerce: any[] =[];


  agenciesMovements: any[] = [];  // Lista de agencias
  messengersMovements: any[] = []; // Lista de mensajeros

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  agenciesDataSource = new MatTableDataSource<any>([]);
  messengersDataSource = new MatTableDataSource<any>([]);

  agenciesDisplayedColumns: string[] = ['ageid', 'agecod', 'movements', 'deliveries', 'returns', 'without_img'];
  messengersDisplayedColumns: string[] = ['mncod', 'fullname', 'agenomb', 'tmedesc', 'movements', 'deliveries', 'returns', 'without_img', 'gains'];

  @ViewChild('agenciesPaginator', { static: true }) agenciesPaginator!: MatPaginator;
  @ViewChild('messengersPaginator', { static: true }) messengersPaginator!: MatPaginator;

  @ViewChild('agenciesSort') agenciesSort: MatSort;
  @ViewChild('messengersSort') messengersSort: MatSort;
  

  // ESTADISTICAS
  currentPage = {
    deliveries: 0,
    effectiveness: 0,
    returns: 0,
    deliveriesMessenger: 0,
    effectivenessMessenger: 0,
    gainsMessenger: 0,
    
  };

  itemsPerPage = {
    deliveries: 5,
    effectiveness: 5,
    returns: 5,
    deliveriesMessenger: 8,
    effectivenessMessenger: 8,
    gainsMessenger: 6,
  };

  totalPages = {
    deliveries: 0,
    effectiveness: 0,
    returns: 0,
    deliveriesMessenger: 0,
    effectivenessMessenger: 0,
    gainsMessenger: 0,
  };

  deliveriesChartData: any;
  effectivenessChartData: any;
  returnsChartData: any;
  
  deliveriesMessengerChartData: any;
  effectivenessMessengerChartData: any;
  gainsMessengerChartData: any;

  deliveriesChartOptions = { responsive: true };
  effectivenessChartOptions = { responsive: true };
  returnsChartOptions = { responsive: true };
  deliveriesMessengerChartOptions = { responsive: true };
  effectivenessMessengerChartOptions = { responsive: true };
  gainsMessengerChartOptions = { responsive: true };

  selectAllMassive: boolean = false;
  selectAllEcommerce: boolean = false;

  constructor(
    private webApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;    

    if (!this.fromDate || !this.toDate) {
      const today = new Date();
      this.toDate = this.formatDate(today);

      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 15);
      this.fromDate = this.formatDate(pastDate);
    }

    this.loadAgencies();
  }

  loadAgencies(){
    this.loading = true;

    const params = {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    };

    this.webApiService.getRequest(this.endpoint, params).subscribe(
      response => {
        if (response.success) {
          this.agencies = response.data.agencies;
          this.agenciesEcommerce = response.data.agenciesEcommerce;

          this.onTypeChange()

          this.selectedAgencies = [this.agencies.find(agency => agency.ageid === 19)!.ageid];

          this.loadData();
        } else {
          console.error("Error al obtener las agencias", response);
        }
      },
      error => {
        console.error("Error en la consulta de agencias", error);
        this.loading = false;
      }
    );
  }

  loadData() {

    const body = {
      fromDate: this.fromDate,
      toDate: this.toDate, 
      selectedAgencies: this.selectedAgencies
    }

    const params = {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,

    }
    this.webApiService.postRequest(this.endpoint + '/get-movements-massive', body, params).subscribe(
      response => {
        if (response.success) {
          this.processResponseData(response)
        } else {
          console.error("Error en la API", response);
        }
        this.loading = false;
      },
      error => {
        console.error("Error al obtener la nómina de mensajeros", error);
        this.loading = false;
      }
    );
  }

  loadDataEcommerce() {
    const body = {
      fromDate: this.fromDate,
      toDate: this.toDate, 
      selectedAgencies: this.selectedAgenciesEcommerce
    }

    const params = {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,

    }
    this.webApiService.postRequest(this.endpoint + '/get-movements-ecommerce', body, params).subscribe(
      response => {
        if (response.success) {
          this.processResponseData(response)
        } else {
          console.error("Error en la API", response);
        }
        this.loading = false;
      },
      error => {
        console.error("Error al obtener la nómina de mensajeros", error);
        this.loading = false;
      }
    );
  }

  processResponseData(response) {
    this.agenciesMovements = response.data.agenciesMovements;
    if(response.data.messengersGains){
      this.messengersMovements = response.data.messengersMovements.map(mensajero => {
        const gains = response.data.messengersGains[mensajero.mncod] || 0;
        return { ...mensajero, gains };
      });
    } else{
      this.messengersMovements = response.data.messengersMovements
    }

    this.agenciesDataSource.data = this.agenciesMovements;
    this.messengersDataSource.data = this.messengersMovements;

    this.agenciesDataSource.paginator = this.agenciesPaginator;
    this.agenciesDataSource.sort = this.agenciesSort;

    this.messengersDataSource.paginator = this.messengersPaginator;
    this.messengersDataSource.sort = this.messengersSort;

    this.initializeCharts();
  }


  initializeCharts() {
    this.totalPages.deliveries = Math.ceil(this.agenciesMovements.length / this.itemsPerPage.deliveries);
    this.currentPage.deliveries = 0; // Reiniciar a la primera página

    this.totalPages.effectiveness = Math.ceil(this.agenciesMovements.length / this.itemsPerPage.effectiveness);
    this.currentPage.effectiveness = 0; // Reiniciar a la primera página

    this.totalPages.returns = Math.ceil(this.agenciesMovements.length / this.itemsPerPage.effectiveness);
    this.currentPage.returns = 0; // Reiniciar a la primera página

    this.totalPages.deliveriesMessenger = Math.ceil(this.messengersMovements.length / this.itemsPerPage.deliveriesMessenger);
    this.currentPage.deliveriesMessenger = 0; // Reiniciar a la primera página

    this.totalPages.effectivenessMessenger = Math.ceil(this.messengersMovements.length / this.itemsPerPage.effectivenessMessenger);
    this.currentPage.effectivenessMessenger = 0; // Reiniciar a la primera página

    this.totalPages.gainsMessenger = Math.ceil(this.messengersMovements.length / this.itemsPerPage.gainsMessenger);
    this.currentPage.gainsMessenger = 0; // Reiniciar a la primera página

    this.loadDeliveriesByAgencie();
    this.loadEffectivenessByAgencie();
    this.loadReturnsByAgencie();
    this.loadDeliveriesByMessenger();
    this.loadEffectivenessByMessenger();
    this.loadGainsByMessenger();

  }

  loadDeliveriesByAgencie() {
    if (this.agenciesMovements.length === 0) {
      console.warn("No hay datos de agencias para mostrar en la gráfica.");
      return;
    }

    const start = this.currentPage.deliveries * this.itemsPerPage.deliveries;
    const end = start + this.itemsPerPage.deliveries;

    const currentData = this.agenciesMovements.slice().sort((a, b) => b.deliveries - a.deliveries).slice(start, end);
    const maxDeliveries = this.agenciesMovements.slice().reduce((max, a) => a.deliveries > max ? a.deliveries : max, 0);

    this.deliveriesChartData = {
      labels: currentData.map(a => a.agecod + ' || ' + a.agenomb),
      datasets: [{ 
        label: 'Entregas Efectivas', 
        data: currentData.map(a => a.deliveries), 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
      }]
    };

    this.deliveriesChartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: maxDeliveries 
          }
        }]
      }
    } as any; 

  }

  loadEffectivenessByAgencie() {
    if (!this.agenciesMovements || this.agenciesMovements.length === 0) {
        console.warn("⚠️ No hay datos de agencias disponibles.");
        this.effectivenessChartData = { labels: [], datasets: [{ label: '', data: [] }] }; 
        return;
    }

    const start = this.currentPage.effectiveness * this.itemsPerPage.effectiveness;
    const end = start + this.itemsPerPage.effectiveness;

    const currentData = this.agenciesMovements.slice().sort((a, b) => b.deliveries - a.deliveries).slice(start, end);
    const maxEffectiveness = 100;

    this.effectivenessChartData = {
        labels: currentData.map(a => a.agecod + ' || ' + a.agenomb),
        datasets: [{ 
            label: 'Tasa de Efectividad (%)', 
            data: currentData.map(a =>{ 
              const totalMovements = a.movements > 0 ? a.movements : 1; // Evitar división por 0
              return (a.deliveries / totalMovements) * 100;
            }),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
        }]
    };

    this.effectivenessChartOptions = {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw} %`
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: (value) => `${value} %` 
          }
        }]
      }
    } as any;
  }

  loadReturnsByAgencie() {
    if (!this.agenciesMovements || this.agenciesMovements.length === 0) {
        console.warn("⚠️ No hay datos de agencias disponibles.");
        this.returnsChartData = { labels: [], datasets: [{ label: '', data: [] }] }; 
        return;
    }

    const start = this.currentPage.returns * this.itemsPerPage.returns;
    const end = start + this.itemsPerPage.returns;

    const currentData = this.agenciesMovements.slice().sort((a, b) => b.returns - a.returns).slice(start, end);
    const maxReturns = this.agenciesMovements.slice().reduce((max, a) => a.returns > max ? a.returns : max, 0);

    this.returnsChartData = {
        labels: currentData.map(a => a.agecod + ' || ' + a.agenomb),
        datasets: [{ 
            label: 'Devoluciones', 
            data: currentData.map(a => a.returns), 
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
        }]
    };

    this.returnsChartOptions = {
      responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              max: maxReturns 
            }
          }]
        }
      } as any; 
  }

  loadDeliveriesByMessenger() {
    if (this.messengersMovements.length === 0) {
      console.warn("No hay datos de Mensajeros para mostrar en la gráfica.");
      return;
    }

    const filteredMessengers = this.messengersMovements.filter(m => m.deliveries > 0);

    if (filteredMessengers.length === 0) {
      console.warn("No hay mensajeros con entregas efectivas.");
      return;
    }

    const start = this.currentPage.deliveriesMessenger * this.itemsPerPage.deliveriesMessenger;
    const end = start + this.itemsPerPage.deliveriesMessenger;

    const currentData = filteredMessengers
      .slice()
      .sort((a, b) => b.deliveries - a.deliveries)
      .slice(start, end);

    const maxDeliveries = filteredMessengers.reduce((max, a) => (a.deliveries > max ? a.deliveries : max), 0);

    this.deliveriesMessengerChartData = {
      labels: currentData.map(a => 
        a.fullname.length > 15 ? a.fullname.substring(0, 12) + '...' : a.fullname
      ),
      datasets: [{ 
        label: 'Entregas Efectivas', 
        data: currentData.map(a => a.deliveries), 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A']
      }]
    };

    this.deliveriesMessengerChartOptions = {
      responsive: true,
      scales: {
        xAxes: [{ 
          ticks: {
            autoSkip: false,      
            maxRotation: 90,      
            minRotation: 90       
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            max: maxDeliveries 
          }
        }]
      }
    } as any; 

  }

  loadGainsByMessenger() {
    if (this.messengersMovements.length === 0) {
      console.warn("No hay datos de Mensajeros para mostrar en la gráfica.");
      return;
    }

    const filteredMessengers = this.messengersMovements.filter(m => m.gains && m.gains > 0);

    if (filteredMessengers.length === 0) {
      console.warn("No hay ganancias de mensajeros.");
      this.gainsMessengerChartData = this.getEmptyChartData("Ganancias Mensajeros");
      return;
    }

    const start = this.currentPage.gainsMessenger * this.itemsPerPage.gainsMessenger;
    const end = start + this.itemsPerPage.gainsMessenger;

    const currentData = filteredMessengers
      .slice()
      .sort((a, b) => b.gains - a.gains)
      .slice(start, end);

    this.gainsMessengerChartData = {
      labels: currentData.map(a => 
        a.fullname.length > 15 ? a.fullname.substring(0, 12) + '...' : a.fullname
      ),
      datasets: [{ 
        label: 'Ganancias de mensajero', 
        data: currentData.map(a => a.gains), 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A']
      }]
    };

    this.gainsMessengerChartOptions = {
      responsive: true,
      scales: {
        xAxes: [{ 
          ticks: {
            autoSkip: false,      
            maxRotation: 90,      
            minRotation: 90       
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value) { 
              return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
            }
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem) {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(tooltipItem.value);
          }
        }
      }
    } as any;
  }

  loadEffectivenessByMessenger() {
    if (!this.messengersMovements || this.messengersMovements.length === 0) {
        console.warn("⚠️ No hay datos de Mensajeros disponibles.");
        this.effectivenessMessengerChartData = { labels: [], datasets: [{ label: '', data: [] }] }; 
        return;
    }

    const start = this.currentPage.effectivenessMessenger * this.itemsPerPage.effectivenessMessenger;
    const end = start + this.itemsPerPage.effectivenessMessenger;

    const currentData = this.messengersMovements.slice().sort((a, b) => b.deliveries - a.deliveries).slice(start, end);
    const maxEffectiveness = 100;

    this.effectivenessMessengerChartData = {
        labels: currentData.map(a => 
          a.fullname.length > 15 ? a.fullname.substring(0, 12) + '...' : a.fullname
        ),  
        datasets: [{ 
            label: 'Tasa de Efectividad (%)', 
            data: currentData.map(a =>{ 
              const totalMovements = a.movements > 0 ? a.movements : 1; // Evitar división por 0
              return (a.deliveries / totalMovements) * 100;
            }),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#8BC34A']
        }]
    };

    this.effectivenessMessengerChartOptions = {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw} %`
          }
        }
      },
      scales: {
        xAxes: [{ 
          ticks: {
            autoSkip: false,      
            maxRotation: 90,      
            minRotation: 90       
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: (value) => `${value} %` 
          }
        }]
      }
    } as any;
  }

  getEmptyChartData(label) {
    return {
        labels: ['Sin datos'],
        datasets: [{
            label: label,
            data: [0],
            backgroundColor: ['#CCCCCC']
        }]
    };
  }

  changePage(direction: 'next' | 'prev', type: 'deliveries' | 'effectiveness' | 'returns' | 'deliveriesMessenger' | 'effectivenessMessenger' | 'gainsMessenger') {
    if (direction === 'next' && this.currentPage[type] < this.totalPages[type] - 1) {
        this.currentPage[type]++;
    } else if (direction === 'prev' && this.currentPage[type] > 0) {
        this.currentPage[type]--;
    }

    if (type === 'deliveries') {
        this.loadDeliveriesByAgencie();
    } else if(type === 'effectiveness') {
        this.loadEffectivenessByAgencie();
    } else if(type === 'returns') {
        this.loadReturnsByAgencie();
    } else if(type === 'deliveriesMessenger') {
        this.loadDeliveriesByMessenger();
    } else if(type === 'effectivenessMessenger') {
        this.loadEffectivenessByMessenger();
    } else if(type === 'gainsMessenger') {
        this.loadGainsByMessenger();
    }
  }

  applyAgenciesFilter(search: string) {
    this.agenciesDataSource.filter = search.trim().toLowerCase();
  }

  applyMessengersFilter(search: string) {
    this.messengersDataSource.filter = search.trim().toLowerCase();
  }

  onTabChange(index: number) {
    this.selectedTab = index === 0 ? 'agencies' : 'messengers';
    
    this.agenciesDataSource.filter = '';
    this.messengersDataSource.filter = '';
  }

  onTypeChange() {
    if (this.selectedType === "massive") {
        this.selectedAgencies = this.agencies.slice(0, 1).map(agency => agency.ageid);
    } else {
        this.selectedAgenciesEcommerce = this.agenciesEcommerce.slice(0, 1).map(agency => agency.agenid);
    }
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }
  
  applyFilter() {
  
    if (!this.fromDate || !this.toDate) {
      this.handler.showError("Debe seleccionar un rango de fechas válido.");
      return;
    }
  
    const fechaInicio = new Date(this.fromDate);
    const fechaFin = new Date(this.toDate);
    const diferenciaDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
  
    if (diferenciaDias > 61) {
      this.handler.showError("Debe seleccionar un rango de fechas máximo de 2 mes.");
      return;
    }

    if (this.selectedType === 'massive') {
      if (!this.selectedAgencies || this.selectedAgencies.length === 0) {
        this.handler.showError("Debe escoger al menos una agencia para el reporte masivo.");
        return;
      } else if(this.selectedAgencies.includes(1) && diferenciaDias > 32){
        this.handler.showError("Debe seleccionar un rango de fechas máximo de 1 mes para la agencia 100||CALI.");
        return;
      }  
    } else if (this.selectedType === 'ecommerce') {
      if (!this.selectedAgenciesEcommerce || this.selectedAgenciesEcommerce.length === 0) {
        this.handler.showError("Debe escoger al menos una agencia para el reporte de ecommerce.");
        return;
      }
    }
    
    this.loading = true;

    if (this.selectedType === 'massive') {
      this.loadData(); // Carga los datos desde la DB de Masivo
    } else if (this.selectedType === 'ecommerce') {
      this.loadDataEcommerce(); // Carga los datos desde la DB de E-commerce
    }
  }
  

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onClickReport() {

    const fechaInicio = new Date(this.fromDate);
    const fechaFin = new Date(this.toDate);
    const diferenciaDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);

    if (diferenciaDias > 61) {
      this.handler.showError("Debe seleccionar un rango de fechas máximo de 2 mes.");
      return;
    }

    if (this.selectedType === 'massive') {
      if (!this.selectedAgencies || this.selectedAgencies.length === 0) {
        this.handler.showError("Debe escoger al menos una agencia para el reporte masivo.");
        return;
      }
      this.downloadReport('massive', this.selectedAgencies, '/generate-paysheet');
    } else if (this.selectedType === 'ecommerce') {
      if (!this.selectedAgenciesEcommerce || this.selectedAgenciesEcommerce.length === 0) {
        this.handler.showError("Debe escoger al menos una agencia para el reporte de ecommerce.");
        return;
      }
      this.downloadReport('ecommerce', this.selectedAgenciesEcommerce, '/generate-paysheet-ecommerce');
    }
  }
  
  downloadReport(type: string, selectedAgencies: number[], endpointPath: string) {
    // Validar que no se seleccione la agencia ID 1 junto a otras
    if (selectedAgencies.includes(1) && selectedAgencies.length > 1) {
      this.handler.showError("Si selecciona la agencia con 100||CALI, no puede elegir más agencias.");
      return;
    }
  
    // Validación de rango de fechas
    if (!this.validateDateRange()) return;
  
    this.handler.showLoadin("Exportando", "Por favor espere...");
    this.loading = true;
  
    const params = {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    };
  
    const body = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      selectedAgencies: selectedAgencies,
    };
  
    this.webApiService.postRequest(this.endpoint + endpointPath, body, params).subscribe(
      response => {
        this.processResponseReport(response);
      },
      error => {
        this.handler.showError("El archivo es demasiado grande para procesarse. Intente reducir el rango de fechas y vuelva a intentarlo. " + error);
        this.loading = false;
      }
    );
  }
  
  validateDateRange(): boolean {
    if (!this.fromDate || !this.toDate) {
      this.handler.showError("Debe seleccionar un rango de fechas válido.");
      return false;
    }
  
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    const differenceInDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  
    if (differenceInDays > 31) {
      this.handler.showError("El rango de fechas no puede ser mayor a 31 días.");
      return false;
    }
    return true;
  }
  
  async processResponseReport(response: any) {
    if (response.success && Array.isArray(response.files)) {
      for (const file of response.files) {
        await this.delay(500); // Esperar 500ms entre cada descarga
        this.downloadFile(file);
      }
  
      this.handler.showSuccess("Todos los archivos han sido descargados.");
    } else {
      this.handler.showError("Error al procesar los archivos.");
    }
  
    this.loading = false;
  }
  
  downloadFile(file: any) {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.fileName || file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  toggleSelectAllAgencies() {
    if (this.selectAllMassive) {
      this.selectedAgencies = this.agencies
        .filter(agency => agency.ageid !== 1) // Excluir CALI (id = 1)
        .map(agency => agency.ageid);
    } else {
      this.selectedAgencies = [];
    }
  }
  
  checkAllSelectedMassive() {
    // Verifica si todas (menos la de id 1) están seleccionadas
    const filteredAgencies = this.agencies.filter(agency => agency.ageid !== 1);
    this.selectAllMassive = filteredAgencies.every(a => this.selectedAgencies.includes(a.ageid));
  }
  
  toggleSelectAllAgenciesEcommerce() {
    if (this.selectAllEcommerce) {
      this.selectedAgenciesEcommerce = this.agenciesEcommerce.map(a => a.agenid);
    } else {
      this.selectedAgenciesEcommerce = [];
    }
  } 
  
  checkAllSelectedEcommerce() {
    this.selectAllEcommerce = this.selectedAgenciesEcommerce.length === this.agenciesEcommerce.length;
  }
}
