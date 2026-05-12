<template>
  <a-row align="center" :gutter="[0, 16]">
    <a-col :span="24">
      <a-card title="Security Settings">
        <a-form :model="form" :rules="rules" :layout="layoutMode" class="base-setting-form" @submit="onSubmit">
          <a-form-item field="admin_secure" extra="Length: 8-18 characters. Must start with /" label="Secure Entry">
            <a-input v-model="form.admin_secure" placeholder="Enter secure entry" allow-clear />
          </a-form-item>

          <a-form-item field="admin_username" label="Admin Account">
            <div class="username-input-wrapper">
              <a-input v-model="form.admin_username" placeholder="Enter admin account" allow-clear />
              <a-button type="text" @click="showPasswordModal" class="password-btn">Change Password</a-button>
            </div>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">Save Settings</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>

  <!-- Change Password modal -->
  <a-modal :width="dialogWidth()" v-model:visible="passwordModalVisible" title="Change Password" @ok="handlePasswordSubmit" @cancel="handlePasswordCancel">
    <a-form :model="passwordForm" auto-label-width :layout="formLayout" :rules="passwordRules" ref="passwordFormRef">
      <a-form-item field="password" label="Current Password">
        <a-input-password v-model="passwordForm.password" placeholder="Enter current password" allow-clear />
      </a-form-item>

      <a-form-item field="new_password" label="New Password">
        <a-input-password v-model="passwordForm.new_password" placeholder="Enter new password" allow-clear />
      </a-form-item>

      <a-form-item field="confirm_password" label="Repeat New Password">
        <a-input-password v-model="passwordForm.confirm_password" placeholder="Enter new password again" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { useDevicesSize } from "@/hooks/useDevicesSize";
import { useLayoutModel } from "@/hooks/useLayoutModel";

import { Message } from "@arco-design/web-vue";
import { setPasswordAPI } from "@/api/modules/user";
import { setsConfAPI } from "@/api/modules/conf/index";

const emit = defineEmits(["refresh"]);
const data = defineModel() as any;
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => (isMobile.value ? "vertical" : "horizontal"));
const { dialogWidth, formLayout } = useLayoutModel();

// basic settings form
const form = ref({
  admin_secure: "",
  admin_username: ""
});

// password edit form
const passwordForm = ref({
  password: "",
  new_password: "",
  confirm_password: ""
});

// password modal related
const passwordModalVisible = ref(false);
const passwordFormRef = ref();

// basic settings validation rules
const rules = {
  admin_secure: [
    {
      required: true,
      message: "Secure Entry is required"
    },
    {
      validator: (value: string, cb: any) => {
        if (!value.startsWith("/")) {
          cb("Secure entry must start with /");
        } else if (value.length < 8) {
          cb("Secure entry must be at least 8 characters");
        } else if (value.length > 18) {
          cb("Secure entry cannot exceed 18 characters");
        } else if (!/^\/[a-zA-Z0-9]+$/.test(value)) {
          cb("Secure entry can only contain letters and numbers");
        } else {
          cb();
        }
      }
    }
  ],
  admin_username: [
    {
      required: true,
      message: "Admin Account is required"
    }
  ]
};

// password edit validation rules
const passwordRules = {
  current_password: [
    {
      required: true,
      message: "Current Password is required"
    }
  ],
  new_password: [
    {
      required: true,
      message: "New Password is required"
    },
    {
      minLength: 6,
      message: "New password must be at least 6 characters"
    }
  ],
  confirm_password: [
    {
      required: true,
      message: "Repeat the new password"
    },
    {
      validator: (value: string, cb: any) => {
        if (value !== passwordForm.value.new_password) {
          cb("The two passwords do not match");
        } else {
          cb();
        }
      }
    }
  ]
};

// save basic settings
const onSubmit = async ({ errors }: ArcoDesign.ArcoSubmit) => {
  if (errors) return;

  try {
    const response = await setsConfAPI([
      { key: "admin_username", value: form.value.admin_username },
      { key: "admin_secure", value: form.value.admin_secure }
    ]);

    if (response && response.code === 200) {
      Message.success("Settings saved successfully！");
      emit("refresh");
    } else {
      Message.error(response?.msg || "Failed to save settings");
    }
  } catch (error: any) {
    Message.error(error);
  }
};

// show password edit modal
const showPasswordModal = () => {
  passwordModalVisible.value = true;
  // reset password form
  passwordForm.value = {
    password: "",
    new_password: "",
    confirm_password: ""
  };
};

// SubmitPasswordEdit
const handlePasswordSubmit = async () => {
  try {
    const valid = await passwordFormRef.value?.validate();
    if (!valid) {
      const response = await setPasswordAPI({
        password: passwordForm.value.password,
        new_password: passwordForm.value.new_password,
        confirm_password: passwordForm.value.confirm_password
      });

      if (response && response.code === 200) {
        Message.success("Password changed successfully. Please log in again.！");
        passwordModalVisible.value = false;
        emit("refresh");
      } else {
        Message.error(response?.msg || "Failed to change password");
      }
    }
  } catch (error: any) {
    console.error("Failed to change password:", error);
    Message.error("Failed to change password. Please try again later.");
  }
};

// CancelPasswordEdit
const handlePasswordCancel = () => {
  passwordModalVisible.value = false;
  passwordForm.value = {
    password: "",
    new_password: "",
    confirm_password: ""
  };
};

// watch data changes and update form
watch(
  () => data.value,
  () => {
    if (data.value) {
      form.value.admin_username = data.value.admin_username || "";
      form.value.admin_secure = data.value.admin_secure || "";
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.row-title {
  font-size: $font-size-title-1;
}

.username-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;

  :deep(.arco-input-wrapper) {
    flex: 1;
    min-width: 180px;
  }

  .password-btn {
    flex-shrink: 0;
  }
}
</style>
