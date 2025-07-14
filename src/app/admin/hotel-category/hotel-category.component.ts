import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import {Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-hotel-category',
  templateUrl: './hotel-category.component.html',
  styleUrls: ['./hotel-category.component.css']
})
export class HotelCategoryComponent {
 dataLoading: boolean = false
  HotelCategoryList: any = []
  HotelCategory: any = {}
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
    this.getHotelCategoryList();
    // this.getHotelCategoryList();
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

  @ViewChild('formHotelCategory') formHotelCategory: NgForm;
  resetForm() {
    this.HotelCategory = {};
    if (this.formHotelCategory) {
      this.formHotelCategory.control.markAsPristine();
      this.formHotelCategory.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.HotelCategory.Status = 1
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
    this.HotelCategory.StateId = event.option.id;
  }


  getHotelCategoryList() {
  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };
  this.dataLoading = true;
  this.service.getHotelCategoryList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.HotelCategoryList = response.HotelCategoryList;
      console.log("HotelCategoryList", this.HotelCategoryList);
      
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}


  saveHotelCategory() {
    this.isSubmitted = true;
    this.formHotelCategory.control.markAllAsTouched();
    if (this.formHotelCategory.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.HotelCategory)).toString()
    }
    this.dataLoading = true;
    this.service.saveHotelCategory(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.HotelCategory.HotelCategoryId > 0) {
          this.toastr.success("HotelCategory Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("HotelCategory added successfully")
        }
        this.resetForm()
        this.getHotelCategoryList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }


  deleteHotelCategory(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteHotelCategory(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getHotelCategoryList()
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
  editHotelCategory(obj: any) {
    this.resetForm()
    this.HotelCategory = obj
  }

}
