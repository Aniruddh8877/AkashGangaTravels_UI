import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import {  EnquiryStatus, FlightOption, MealPlan, Months, Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css']
})
export class EnquiryComponent {
 dataLoading: boolean = false
  EnquiryList: any = []
  Enquiry: any = {};
  isSubmitted = false
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  MonthList = this.loadData.GetEnumList(Months);
  FlightOptionList = this.loadData.GetEnumList(FlightOption);
  MealPlanList = this.loadData.GetEnumList(MealPlan);
  EnquiryStatusList = this.loadData.GetEnumList(EnquiryStatus);

  AllFlightOptionList = FlightOption;
  AllMealPlanList= MealPlan;
  AllEnquiryStatusList = EnquiryStatus;
  // AllMonthList = Month;
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  DestinationList: any;
  PackageList: any;
  HotelCategoryList: any;
  Service: any;
  DestinationListAll: any;

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
    this.getEnquiryList(this.Enquiry.DestinationId);
    this.getDestinationList();
    this.getPackageList(this.DestinationList?.[0]?.DestinationId);
    this.getHotelCategoryList();
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

  @ViewChild('formEnquiry') formEnquiry: NgForm;
  resetForm() {
    this.Enquiry = {
      EnquiryStatus: 1,
    };
    if (this.formEnquiry) {
      this.formEnquiry.control.markAsPristine();
      this.formEnquiry.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Enquiry.Status = 1
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
    this.Enquiry.StateId = event.option.id;
  }

getEnquiryList(destinationId: any) {
  const requestData = {
    DestinationId: destinationId || 0,
    Months: this.Enquiry.Month || 0,
    FromDate: this.Enquiry.FromDate ? this.loadData.loadDateYMD(this.Enquiry.FromDate) : null,
    ToDate: this.Enquiry.ToDate ? this.loadData.loadDateYMD(this.Enquiry.ToDate) : null
  };

  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(requestData)).toString()
  };

  this.dataLoading = true;
  this.service.getEnquiryList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.EnquiryList = response.EnquiryList;
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}


  saveEnquiry() {
    this.isSubmitted = true;
    this.formEnquiry.control.markAllAsTouched();
    this.Enquiry.CreatedBy = this.staffLogin.StaffLoginId;
    this.Enquiry.UpdatedBy = this.staffLogin.StaffLoginId;
    this.Enquiry.TravelPlanDate = this.loadData.loadDateYMD(this.Enquiry.TravelPlanDate);
    if (this.formEnquiry.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Enquiry)).toString()
    }
    this.dataLoading = true;
    this.service.saveEnquiry(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Enquiry.EnquiryId > 0) {
          this.toastr.success("Enquiry Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Enquiry added successfully")
        }
        this.resetForm()
        this.getEnquiryList(0)
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }


  deleteEnquiry(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteEnquiry(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getEnquiryList(0)
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
  editEnquiry(obj: any) {
    this.resetForm()
    this.Enquiry = obj
  }

    getDestinationList() {
  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };
  this.dataLoading = true;
  this.service.getDestinationList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.DestinationList = response.DestinationList;
      console.log("Destination",this.DestinationList);
      
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}

  getPackageList(DestinationId:any) {
    var requestData = { DestinationId: DestinationId || 0 };
    if (DestinationId) {
      this.Enquiry.PackageId = 0; // Reset package selection when destination changes
    }
  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(requestData)).toString()
  };
  this.dataLoading = true;
  this.service.getPackageList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.PackageList = response.PackageList;
      console.log("PackageList", this.PackageList);
      
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}

  getHotelCategoryList() {
  const request: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };
  this.dataLoading = true;
  this.service.getHotelCategoryList(request).subscribe((response: any) => {
    if (response.Message === ConstantData.SuccessMessage) {
      this.HotelCategoryList  = response.HotelCategoryList ;
      console.log("HotelCategoryList", this.HotelCategoryList );
      
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, () => {
    this.toastr.error("Error while fetching records");
    this.dataLoading = false;
  });
}

onDestinationChange(destinationId: number): void {
  this.Enquiry.PackageId = null; // Reset package selection
  this.PackageList = this.getPackageList(destinationId); // ✅ Use correct variable
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
    this.Enquiry.DestinationId = event.option.id;
    this.Enquiry.DestinationName = event.option.value;
    console.log(this.Enquiry.DestinationId);
    this.getEnquiryList(this.Enquiry.DestinationId);
  }

  clearDestination() {
    this.DestinationListAll = this.DestinationList;
    this.Enquiry.DestinationId = null;
    this.Enquiry.DestinationName = '';
    this.getEnquiryList(0);
  }






  
}
