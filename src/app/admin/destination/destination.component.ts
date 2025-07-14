import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { DestinationType, Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-destination',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.css']
})
export class DestinationComponent {
  dataLoading: boolean = false
  DestinationList: any = []
  Destination: any = {}
  isSubmitted = false
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  StatusList = this.loadData.GetEnumList(Status);
  DestinationTypeList = this.loadData.GetEnumList(DestinationType);

  AllDestinationList = DestinationType;
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }
  onTableDataChange(p: any) {
    this.p = p
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getDestinationList();
    
    this.resetForm();
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(request).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  @ViewChild('formDestination') formDestination: NgForm;
  resetForm() {
    this.Destination = {};
    if (this.formDestination) {
      this.formDestination.control.markAsPristine();
      this.formDestination.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Destination.Status = 1
  }

  filterStateList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterState = this.StateList.filter((option: any) => option.StateName.toLowerCase().includes(filterValue));
    } else {
      this.filterState = this.StateList;
    }
  }

  afterStateSelected(event: any) {
    this.Destination.StateId = event.option.id;
  }

  getDestinationList() {
  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };
  this.dataLoading = true;
  this.service.getDestinationList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.DestinationList = response.DestinationList;
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}


  saveDestination() {
    this.isSubmitted = true;
    this.formDestination.control.markAllAsTouched();
    this.Destination.CreatedBy = this.staffLogin.StaffLoginId;
    this.Destination.UpdatedBy = this.staffLogin.StaffLoginId;
    if (this.formDestination.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Destination)).toString()
    }
    this.dataLoading = true;
    this.service.saveDestination(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Destination.DestinationId > 0) {
          this.toastr.success("Destination Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Destination added successfully")
        }
        this.resetForm()
        this.getDestinationList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }


  deleteDestination(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteDestination(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getDestinationList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false;
      }))
    }
  }
  editDestination(obj: any) {
    this.resetForm()
    this.Destination = obj
  }


}
