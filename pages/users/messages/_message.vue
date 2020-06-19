<template>
  <div class="container">
    <div v-if="admin">:)</div>
    <div class="profileWrap" v-if="setData && !admin">
      <div class="modalWrap" v-if="deleteModalVisible">
        <div class="modalContent">
          <a class="modalCloseBtn" @click="deleteModalVisible = false "><font-awesome-icon icon="times" /></a>
          <div class="modalHead">
            <span class="mHeadline">Bütün mesajlar silinecek, onaylıyor musunuz?</span>
          </div>
          <div class="modalMiddle">
            <div class="btnsWrap">
              <button class="button primaryBtn" @click="deleteModalVisible = false ">İptal</button>
              <button class="button errorBtn" @click="removeMessages()">Sil</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modalWrap" v-if="showBigPPModal">
        <div class="modalContent">
          <a class="modalCloseBtn" @click="showBigPPModal = false "><font-awesome-icon icon="times" /></a>
          <div class="showBigPPModal">
            <img :src="account.account.pPhoto" :alt="account.name">
          </div>
        </div>
      </div>
      <div class="notify success" v-if="notify">
        <span>{{ notifyMsg }}</span>
        <font-awesome-icon :icon="notifyIcon" />
      </div>
      <div class="profileInfoHead">
        <div class="profilPhoto">
          <img v-if="account.account.pPhoto" :src="account.account.pPhoto" :alt="account.name" @click="showBigPP">
        </div>
        <ul>
          <li class="fullName">{{ account.account.name }} {{ account.account.surname }}</li>
          <li class="complateProfileBtn friendMessage">
            <nuxt-link :to="{ name: 'users-friendID', params: {friendID: account.uid} }" class="primaryBtn messageBtn">
              Profil bilgileri <font-awesome-icon icon="info-circle" />
            </nuxt-link>
            <nuxt-link :to="{ name: 'users-friendPhotos', params: {friendPhotos: account.uid} }" class="primaryBtn messageBtn">
              Fotoğraflar <font-awesome-icon icon="image" />
            </nuxt-link>
            <span class="userPageMenu">
              <a class="userPageMenuBtn"><font-awesome-icon icon="ellipsis-h" /></a>
              <ul class="subList">
                <li><a @click="deleteModal">Tüm mesajları sil</a></li>
              </ul>
            </span>
          </li>
        </ul>
      </div>
      <div class="messagesWrap">
        <ul class="msgHistory">
          <li v-for="msg in messageList" :class="[ msg.author === userDisplayName? 'sentMsg' : 'receivedMsg' ]">
            <span class="from">{{msg.author}} : </span>
            <span class="msg">{{msg.message}}</span>
            <span class="time">{{msg.time}}</span>
          </li>
        </ul>
        <div class="sendMessageLine">
          <input @keyup.enter="sendMessage" v-model="messageInput" class="sendMessageInput" type="text" placeholder="Mesaj yaz...">
          <a class="sendMessageBtn" @click="sendMessage"><font-awesome-icon icon="angle-right" /></a>
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
      account: [],
      setData: false,
      messageInput: '',
      friendUserID: '',
      messageList: [],
      authUser: '',
      userDisplayName: '',
      friendFullName: '',
      orderTime: '',
      deleteModalVisible: false,
      notify: false,
      notifyMsg: '',
      notifyIcon: '',
      admin: false,
      adminID: '',
      showBigPPModal: false,
      ownerChatList: [],
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
  created() {
    this.friendUserID = this.$route.params.message;
    this.setUser();

    let self = this;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        self.authUser = user;
        if(self.authUser.uid == self.friendUserID) {
          self.admin = true;
        }
        firebase.firestore().collection("profiles").where("uid", "==", self.authUser.uid).get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            var user_name = doc.data().account.name;
            var user_surname = doc.data().account.surname;
            self.userDisplayName = user_name + ' ' + user_surname;
          });
          if(self.account.uid == self.adminID) {
            self.admin = true;
          }
          self.getMessages();
        });
      } else {
        self.authUser = {};
      }
    });
  },
  methods: {
    async setUser() {
      let self = this;
      await firebase.firestore().collection("profiles").where("uid", "==", self.friendUserID).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          self.account = doc.data();
        });
        self.friendFullName = `${self.account.account.name} ${self.account.account.surname}`;
        self.setData = true;
      });
    },
    scrollToBottom() {
      let box = document.querySelector('.msgHistory');
      box.scrollTop = box.scrollHeight;
    },
    async sendMessage() {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;

      var result = today.toLocaleString("tr-TR", { // you can skip the first argument
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      this.orderTime = result.split('.').join('').split(':').join('').split(' ').join('');
      
      //save msg to sender account database
      let self = this;
      await firebase.firestore().collection("profiles").doc(self.authUser.uid).collection(self.friendUserID).add({
        time: dateTime,
        message: self.messageInput,
        author: self.userDisplayName,
        orderTime: self.orderTime
      });

      //get chat person ids
      var existChatList = [];
      await firebase.firestore().collection("profiles").where("uid", "==", self.authUser.uid).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          existChatList = doc.data().chatList;
        });
      });

      if(existChatList != undefined && existChatList.length > 0) {
        for(var i = 0; i < existChatList.length; i++) {
          if(existChatList[i] != this.friendUserID) {
            var chatList = [];
            var item = {};
            item = this.friendUserID;
            chatList.push(item);
            var chatListFinal = existChatList.concat(chatList);
          } else {
            var chatListFinal = existChatList;
          }
        }
      } 
      if(existChatList == null || existChatList == undefined) {
        var chatList = [];
        var item = {};
        item = this.friendUserID;
        chatList.push(item);
        var chatListFinal = chatList;
      }
      if(existChatList != undefined && existChatList.length == 0) {
        var chatListFinal = [];
        var item = {};
        item = this.friendUserID;
        chatListFinal.push(item);
      }

      firebase.firestore().collection("profiles").doc(self.authUser.uid).set({
        chatList: chatListFinal
      }, { merge: true })

      //save msg to recivier account database
      await firebase.firestore().collection("profiles").doc(self.friendUserID).collection(self.authUser.uid).add({
        time: dateTime,
        message: self.messageInput,
        author: self.userDisplayName,
        orderTime: self.orderTime,
      })

      var existChatList = [];
      await firebase.firestore().collection("profiles").where("uid", "==", self.friendUserID).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          existChatList = doc.data().chatList;
        });
      });

      if(existChatList != undefined && existChatList.length > 0) {
        for(var i = 0; i < existChatList.length; i++) {
          if(existChatList[i] != this.authUser.uid) {
            var chatList = [];
            var item = {};
            item = this.authUser.uid;
            chatList.push(item);
            var chatListFinal = existChatList.concat(chatList);
          } else {
            var chatListFinal = existChatList;
          }
        }
      } 
      if(existChatList == null || existChatList == undefined) {
        var chatList = [];
        var item = {};
        item = this.authUser.uid;
        chatList.push(item);
        var chatListFinal = chatList;
      }
      if(existChatList != undefined && existChatList.length == 0) {
        var chatListFinal = [];
        var item = {};
        item = this.authUser.uid;
        chatListFinal.push(item);
      }

      firebase.firestore().collection("profiles").doc(self.friendUserID).set({
        chatList: chatListFinal
      }, { merge: true })

      self.messageInput = '';
      self.scrollToBottom();
      self.getMessages();
    },
    async getMessages() {      
      let self = this;
      firebase.firestore().collection("profiles").doc(self.authUser.uid).collection(self.friendUserID)
      .orderBy('orderTime').onSnapshot((querySnapshot) => {
        let allMessages = [];
        querySnapshot.forEach(doc => {
          allMessages.push(doc.data())
        });
        self.messageList = allMessages;
        setTimeout(() => {
          self.scrollToBottom();
        },100);
      });
    },
    deleteModal() {
      this.deleteModalVisible = true;
    },
    async removeMessages() {
      this.deleteModalVisible = false;
      let self = this;
      await firebase.firestore().collection("profiles").doc(self.authUser.uid).collection(self.friendUserID).get()
      .then(response => {
        response.forEach(element => {
          element.ref.delete();
        });

        firebase.firestore().collection("profiles").where("uid", "==", self.authUser.uid).get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            self.ownerChatList = doc.data().chatList;
          });

          for(var y = 0; y < self.ownerChatList.length; y++) {
            if(self.friendUserID == self.ownerChatList[y]) {
              self.ownerChatList.splice(y, 1)
              firebase.firestore().collection("profiles").doc(self.authUser.uid).set({
                chatList: self.ownerChatList
              }, { merge: true })
              .then(function() {
              })
            }
          }
        });

        self.notify = true;
        self.notifyMsg = 'Tüm mesajlar silindi';
        self.notifyIcon = 'check';
        setTimeout(() => {
          self.notify = false;
        }, 5000);
      });
    },
    showBigPP() {
      this.showBigPPModal = true;
    }
  }
}
</script>