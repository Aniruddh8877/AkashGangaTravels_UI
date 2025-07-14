import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.css']
})
export class PackageComponent {
  dataLoading: boolean = false
  PackageList: any = []
  Package: any = {}
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

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  DestinationList: any;
  DestinationListAll: any=[];
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
    this.getPackageList(this.Package.DestinationId);
    this.getDestinationList();
    // this.getPackageList(this.Destination.DestinationId);

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

  @ViewChild('formPackage') formPackage: NgForm;
  resetForm() {
    this.Package = {};
    if (this.formPackage) {
      this.formPackage.control.markAsPristine();
      this.formPackage.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Package.Status = 1
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
    this.Package.StateId = event.option.id;
  }

  getPackageList(DestinationId:any) {
    const request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({DestinationId})).toString()
    };
    this.dataLoading = true;
    this.service.getPackageList(request).subscribe((response: any) => {
      if (response.Message === ConstantData.SuccessMessage) {
        this.PackageList = response.PackageList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, () => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    });
  }


  savePackage() {
    this.isSubmitted = true;
    this.formPackage.control.markAllAsTouched();
    this.Package.CreatedBy = this.staffLogin.StaffLoginId;
    this.Package.UpdatedBy = this.staffLogin.StaffLoginId;
    if (this.formPackage.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Package)).toString()
    }
    this.dataLoading = true;
    this.service.savePackage(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Package.PackageId > 0) {
          this.toastr.success("Package Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Package added successfully")
        }
        this.resetForm()
        this.getPackageList(0);
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }


  deletePackage(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deletePackage(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getPackageList(0)
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
  editPackage(obj: any) {
    this.resetForm()
    this.Package = obj
  }


  getDestinationList() {
    const request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    this.dataLoading = true;
    this.service.getDestinationList(request).subscribe((response: any) => {
      if (response.Message === ConstantData.SuccessMessage) {
        this.DestinationList = response.DestinationList;
        console.log(this.DestinationList);
        
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, () => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    });
  }

  filterDestinationList(value: any) {
    if (value) {
      const DestinationFilterValue = value.toLowerCase();
      this.DestinationListAll = this.DestinationList.filter((option: any) =>
        option.DestinationName.toLowerCase().includes(DestinationFilterValue)
      );
    } else {
    }
  }

  afterDestinationSelected(event: any) {
    this.Package.DestinationId = event.option.id;
    this.Package.DestinationName = event.option.value;
    console.log(this.Package.DestinationId);
    this.getPackageList(this.Package.DestinationId);
  
  }

  clearDestination() {
    this.DestinationListAll = this.DestinationList;
    this.Package.DestinationId = null;
    this.Package.DestinationName = '';
  }
}
