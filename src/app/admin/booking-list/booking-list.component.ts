import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status, Category, FlightOption, MealPlan, Title, EnquiryStatus } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { Title } from '@angular/platform-browser';
declare var $: any;


@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent {
  dataLoading: boolean = false;
  EnquiryList: any = [];
  PackageList: any = [];
  // IDTypeList: any = [];
  DestinationList: any = [];
  HotelCategoryList: any = [];
  IDTypeList: any = [];
  AgentList: any = [];
  Patient: any = {};
  Payment: any = {};
  isSubmitted = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  StatusList = this.loadData.GetEnumList(Status);
  GenderList = this.loadData.GetEnumList(Gender);
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  FlightOptionList = this.loadData.GetEnumList(FlightOption);
  MealPlanList = this.loadData.GetEnumList(MealPlan);
  TitleList = this.loadData.GetEnumList(Title);
  EnquiryStutusList = this.loadData.GetEnumList(EnquiryStatus);

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  AllGenderList = Gender;
  AllCategoryList = Category;
  AllPaymentModeList = PaymentMode;
  AllFlightOptionList = FlightOption;
  AllMealPlanList = MealPlan;
  AllTitleList = Title;
  AllEnquiryList = EnquiryStatus;
  currentPayment: any = [];
  tempData: any;
  filteredEnquiryList: any = [];
  EnquiryListAll: any;
  OpticalList: any = [];
  ChargeList: any;
  Package: any;
  Booking: any = [];
  Guest: any = [];
  DesignationList: any;
  selectedEnquiry: any = null;
  BookingList: any=[];


  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {


    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();

    // this.resetForm();

  }


 validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

getBookingList(){
   var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getEnquiryList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BookingList = response.BookingList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
      }
    );
}


}
