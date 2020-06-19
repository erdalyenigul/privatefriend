<template>
  <div class="welcome">
    <div class="welcomeForm">
      <div class="formHead"><font-awesome-icon icon="user-circle" /> Ücretsiz yeni üyelik</div>
      <form @submit.prevent="register">
        <span class="formW100">
          <span class="formW50"><input required type="text" placeholder="İsim" v-model="account.name" /></span>
          <span class="formW50"><input required type="text" placeholder="Soyisim" v-model="account.surname" /></span>
        </span>
        <span class="formW100">
          <input required type="email" placeholder="E-posta" v-model="account.email" />
        </span>
        <span class="formW100">
          <div class="gender">
            <span class="formW50">
              <span class="inputHead">Cinsiyetiniz</span>
              <div class="form-radio">
                <div class="radio">
                  <label>
                    <input required v-model="account.person.gender" value="Erkek" type="radio" name="gender" /><i class="helper"></i> Erkek
                  </label>
                </div>
                <div class="radio">
                  <label>
                    <input required v-model="account.person.gender" value="Kadın" type="radio" name="gender" /><i class="helper"></i> Kadın
                  </label>
                </div>
              </div>
            </span>
            <span class="formW50">
              <span class="inputHead">Doğum tarihiniz</span>
              <div class="dateInput">
                <client-only>
                  <date-picker required placeholder="GG/AA/YYYY" format="dd-MM-yyyy" v-model="account.person.birthday" />
                </client-only>
              </div>
            </span>
          </div>
        </span>
        <span class="formW100">
          <span class="formW50"><input required type="password" placeholder="Şifre" v-model="account.password" /></span>
          <span class="formW50"><input required type="password" placeholder="Şifre tekrar" v-model="passwordAgain" /></span>
        </span>
        <span class="formW100">
          <span class="formW50"><div v-if="errorPass" class="errorMsg">Şifreler aynı olmalı!</div></span>
          <span class="formW50"><div v-if="errorServer" class="errorMsg">{{ errorServerMsg }}</div></span>
        </span>
        <button type="submit" class="button primaryBtn">ÜYE OL</button>
      </form>
    </div>
    <div class="welcomeBottom">
      <span>Üye misiniz?</span>
      <button class="button bottomBtn" @click="$router.push('/')">GİRİŞ YAP</button>
    </div>
    <div class="overlayBg"></div>
  </div>
</template>

<script>
import firebase from 'firebase/app';

export default {
  data() {
    return {
      account: {
        pPhoto: '',
        name: '',
        surname: '',
        email: '',
        password: '',
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
      },
      passwordAgain: '',
      errorPass: '',
      errorServer: false,
      errorServerMsg: '',
    }
  },
  created() {
        
  },
  methods: {
    register() {
      let birthdayLongDate = new Date(this.account.person.birthday);
      this.account.person.birthday = birthdayLongDate.toLocaleDateString("tr-TR");

      let getAgeFromtBirthday = this.account.person.birthday;
      let userBirthYear = getAgeFromtBirthday.split('.').reverse()[0];
      let currentDate = new Date();
      let currentYear = currentDate.getFullYear();
      var userAge = currentYear - userBirthYear;
      this.account.person.age = userAge;

      let self = this;
      if(this.account.password == this.passwordAgain) {
        firebase.auth().createUserWithEmailAndPassword(this.account.email, this.account.password)
        .then((userData) => {
          userData.user.sendEmailVerification();
          self.setUser();
        })
        .catch(function(error) {
          self.errorServer = true;
          self.errorServerMsg = error.message;
          setTimeout(() => {
            self.errorServer = false;
          }, 5000);
        });
      } else {
        this.errorPass = true;
        setTimeout(() => {
          this.errorPass = false;
        }, 5000);
      }
    },
    setUser() {
      let self = this;
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          console.log(user.uid);
          localStorage.setItem('uid', user.uid);
          firebase.firestore().collection('profiles').doc(user.uid).set({
            account: self.account,
            uid: user.uid,
          }).then(() => {
            self.$router.push('/account/profile');
          })
        } else {
          console.log('user kaydedilmedi');
        }
      });
    }
  }
};
</script>

