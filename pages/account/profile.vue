<template>
  <div class="container">
    <div class="errorMsg emailVerified" v-if="email_verified">
      E-posta adresiniz onaylanmadı, lütfen e-postanıza gidin ve onaylayın. <br> Onayladıktan sonra sayfayı yenileyin.
    </div>
    <div class="modalWrap" v-if="showBigPPModal">
      <div class="modalContent">
        <a class="modalCloseBtn" @click="showBigPPModal = false "><font-awesome-icon icon="times" /></a>
        <div class="showBigPPModal">
          <img :src="account.pPhoto" :alt="account.name">
        </div>
      </div>
    </div>
    <div class="profileWrap" v-if="!email_verified && setData">
      <div class="profileInfoHead">
        <div class="profilPhoto">
          <img v-if="account.pPhoto" :src="account.pPhoto" :alt="account.name" @click="showBigPP">
        </div>
        <ul>
          <li class="fullName">{{ account.name }} {{ account.surname }}</li>
          <li class="email">{{ account.email }}</li>
          <li class="complateProfileBtn" v-if="admin">
            <nuxt-link to="edit" class="primaryBtn">
              Profil düzenle <font-awesome-icon icon="user-edit" />
            </nuxt-link>
            <nuxt-link to="/account/photos">
              Fotoğraflar <font-awesome-icon icon="images" />
            </nuxt-link>
          </li>
        </ul>
      </div>
      <div class="firstInfoPhoto" v-if="firstTouch && admin">
        <nuxt-link to="edit" class="addBioBtn"><font-awesome-icon icon="exclamation-circle" /> Profil sayfanızı oluşturmak için bir biyografi ekleyin.</nuxt-link>
        <img src="@/assets/images/dating.jpg" alt="">
      </div>
      <div class="profileDetail" v-if="!firstTouch">
        <div class="pdLine textarea">
          <div class="pdHead">Biyografi :</div>
          <span class="textareaWrap">
            <textarea disabled v-model="account.person.biography"></textarea>
          </span>
        </div>        
        <div class="pdLine">
          <div class="uiLineLeft">Cinsiyet</div>
          <div class="uiLineRight">{{ account.person.gender }}</div>
        </div>
        <div class="pdLine">
          <div class="uiLineLeft">Doğum tarihi</div>
          <div class="uiLineRight">{{ account.person.birthday }}</div>
        </div>
        <div class="pdLine">
          <div class="uiLineLeft">Yaş</div>
          <div class="uiLineRight">{{ account.person.age }}</div>
        </div>
        <div class="pdLine">
          <div class="uiLineLeft">Şehir</div>
          <div class="uiLineRight">{{ account.person.city }}</div>
        </div>
        <div class="pdLine">
          <div class="uiLineLeft">İş</div>
          <div class="uiLineRight">{{ account.other.job }}</div>
        </div>
        <div class="pdLine">
          <div class="uiLineLeft">Eğitim</div>
          <div class="uiLineRight">{{ account.other.education }}</div>
        </div>
        <div class="pdLine longMB">
          <div class="uiLineLeft">Burç</div>
          <div class="uiLineRight">{{ account.other.zodiac_sign }}</div>
        </div>
        <div class="pdLine textarea">
          <div class="pdHead">İlgi alanları :</div>
          <span class="textareaWrap">
            <textarea disabled v-model="account.other.interest"></textarea>
          </span>
        </div>
        <div class="pdLine textarea">
          <div class="pdHead">Favori filmler :</div>
          <span class="textareaWrap">
            <textarea disabled v-model="account.other.movies"></textarea>
          </span>
        </div>
        <div class="pdLine textarea">
          <div class="pdHead">Sevdiği müzik grupları/sanatçıları :</div>
          <span class="textareaWrap">
            <textarea disabled v-model="account.other.music"></textarea>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      emailVerified: false,
      user: '',
      email_verified: false,
      ppImageFile: '',
      userID: '',
      setData: false,
      firstTouch: true,
      admin: false,
      showBigPPModal: false,

      account: {
        pPhoto:'',
        name: '',
        surname: '',
        email: '',
        person : {
          biography: '',
          gender:'',
          age:'',
          birthday:'',
          city:'',
        },
        other: {
          interest: '',
          job: '',
          education: '',
          zodiac_sign: '',
          movies: '',
          music: '',
        }
      }
    }
  },
  asyncData({ req, redirect, route }) {
    if (process.server) {
      var user = getUserFromCookie(req);
      if (!user) {
        redirect("/");
      } else {        
        
      }
      return {user: user}
    }
  },
  mounted() {
    this.userGetAccount();
  },
  methods: {
    async userGetAccount(){
      let self = this;
      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          if(user.uid == localStorage.getItem('uid')) {
            this.admin = true;
          } else {
            console.log('!admin')
          }
          self.userID = user.uid;
          if(user.emailVerified) {
            this.email_verified = false;
            firebase.firestore().collection("profiles").where("uid", "==", self.userID).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                self.account = doc.data().account;
              });
              self.setData = true;
              if(self.account.person.biography.length > 0) {
                self.firstTouch = false
                let getAgeFromtBirthday = self.account.person.birthday;
                let ageSet = getAgeFromtBirthday.split('.').reverse()[0];
                let fullDate = new Date();
                let year = fullDate.getFullYear();
                var age = year - ageSet;
                self.account.person.age = age;
              }
            });

            firebase.storage().ref('profiles/' + self.userID).getDownloadURL()
            .then(function(url) {
              self.ppImage = url;
            })
            .catch(function(error) {
              console.log(error.message);
            });

          } else {
            this.email_verified = true;
          }
        }
      });
    },
    showBigPP() {
      this.showBigPPModal = true;
    }
  }
}
</script>