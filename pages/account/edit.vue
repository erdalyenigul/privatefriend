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
          <li class="complateProfileBtn">
            <input type="file" ref="uploadPP" @change="previewPP($event)" class="uploadPPInput">
            <a @click="$refs.uploadPP.click()" class="button primaryBtn">
              Profil fotoğrafı yükle <font-awesome-icon icon="image" />
            </a>
            <nuxt-link to="profile" class="button">
              Profilimi gör <font-awesome-icon icon="angle-right" />
            </nuxt-link>
          </li>
          <li>
            <a class="removePphoto" @click="removePphoto">Profil fotoğrafımı kaldır</a>
          </li>
        </ul>
      </div>
      <form @submit.prevent="saveProfile">
        <div class="profileDetail">
          <div class="pdLine textarea">
            <div class="pdHead">Biyografi*</div>
            <span class="textareaWrap">
              <textarea v-model="account.person.biography" placeholder="En az 150 karakter"></textarea>
            </span>
          </div>        
          <div class="pdLine">
            <div class="uiLineLeft">Doğum tarihi*</div>
            <div class="uiLineRight">
              <div class="dateInput">
                <client-only>
                  <date-picker required placeholder="GG/AA/YYYY" format="dd-MM-yyyy" v-model="account.person.birthday" />
                </client-only>
              </div>
            </div>
          </div>
          <div class="pdLine mb40">
            <div class="uiLineLeft">Şehir*</div>
            <div class="uiLineRight"><input required v-model="account.person.city" type="text" name="" placeholder="Şehir"></div>
          </div> 
          <div class="pdLine">
            <div class="uiLineLeft">İş</div>
            <div class="uiLineRight">
              <input v-model="account.other.job" type="text" name="" placeholder="İş">
            </div>
          </div>
          <div class="pdLine">
            <div class="uiLineLeft">Eğitim</div>
            <div class="uiLineRight">
              <input v-model="account.other.education" type="text" name="" placeholder="Eğitim">
            </div>
          </div>
          <div class="pdLine longMB">
            <div class="uiLineLeft">Burç</div>
            <div class="uiLineRight">
              <input v-model="account.other.zodiac_sign" type="text" name="" placeholder="Burç">
            </div>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">İlgi alanları</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.interest"></textarea>
            </span>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">Sevdiği filmler</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.movies"></textarea>
            </span>
          </div>
          <div class="pdLine textarea">
            <div class="pdHead">Sevdiği müzik grupları/sanatçılar</div>
            <span class="textareaWrap">
              <textarea v-model="account.other.music"></textarea>
            </span>
          </div>
          <div class="notify success" v-if="notify">
            <span>{{ notifyMsg }}</span>
            <font-awesome-icon :icon="notifyIcon" />
          </div>
        </div>
        <div class="bottomBtns">
          <button class="button primaryBtn saveBtn" type="submit">Kaydet <font-awesome-icon icon="save" /></button>
          <nuxt-link to="profile" class="button secondaryBtn backToProfile">
            Vazgeç <font-awesome-icon icon="angle-right" />
          </nuxt-link>
        </div>
      </form>
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
      ppImage: false,
      ppImageFile: '',
      userID: '',
      notify: false,
      notifyMsg: '',
      notifyIcon: '',
      setData: false,
      showBigPPModal: false,

      account: {
        pPhoto: '',
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
          self.userID = user.uid;
          if(user.emailVerified) {
            this.email_verified = false;
            firebase.firestore().collection("profiles").where("uid", "==", self.userID).get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                self.account = doc.data().account;
              });
              self.setData = true;
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
    saveProfile() {
      let self = this;
      if(this.account.person.biography.length >= 150) {
        firebase.firestore().collection("profiles").doc(self.userID).set({
          account: self.account
        }, { merge: true })
        .then(function() {
          self.notify = true;
          self.notifyMsg = 'Profil başarıyla güncellendi';
          self.notifyIcon = 'check';
          setTimeout(() => {
            self.notify = false;
          }, 5000);
        })
        .catch(function(error) {
          console.error("Error writing document: ", error);
        });
      } else { 
        self.notify = true;
        self.notifyIcon = 'exclamation-circle';
        self.notifyMsg = 'Biyografi en az 150 karakter olmalı.';
        setTimeout(() => {
          this.notify = false;
        }, 5000);
      }
    },
    previewPP(e) {
      if(e.target.files[0]) {
        this.ppImageFile = e.target.files[0];
        this.account.pPhoto = URL.createObjectURL(this.ppImageFile);
        this.updatePP();
      }
    },
    async updatePP(e) {
      var self = this;

      let storageRef = firebase.storage().ref('profiles/' + self.userID);
      if(storageRef){
        storageRef.delete().then(function() {}).catch(function(error) {});
      }

      let uploadTask = storageRef.put(this.ppImageFile);
      await uploadTask.on("state_changed", snapshot => {
        
        firebase.storage().ref('profiles/' + self.userID).getDownloadURL()
        .then(function(url) {
          firebase.firestore().collection("profiles").doc(self.userID).set({
            account: {
              pPhoto: url
            }
          }, { merge: true })
          .then(function() {

          })
          .catch(function(error) {
            console.error("Error writing document: ", error);
          });
        })
        .catch(function(error) {
          console.log(error.message);
        });
      },error => {
        console.log(error.message);
      });
    },
    showBigPP() {
      this.showBigPPModal = true;
    },
    removePphoto() {
      console.log('asas');

      var self = this;
      let storageRef = firebase.storage().ref('profiles/' + self.userID);
      storageRef.delete().then(function() {
        console
      }).catch(function(error) {});
    }
  }
}
</script>