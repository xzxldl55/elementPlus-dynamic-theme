<template>
    <el-dialog
        v-model="dialogVisible"
        title="主题配置"
        width="640px"
        draggable
        :close-on-click-modal="false"
    >
        <el-form label-position="left" :label-width="80">
            <el-form-item label="主色：">
                <el-color-picker v-model="themeConfig.colors.primary" />
            </el-form-item>
            <el-form-item label="消息色：">
                <el-color-picker v-model="themeConfig.colors.info" />
            </el-form-item>
            <el-form-item label="成功色：">
                <el-color-picker v-model="themeConfig.colors.success" />
            </el-form-item>
            <el-form-item label="警告色：">
                <el-color-picker v-model="themeConfig.colors.warning" />
            </el-form-item>
            <el-form-item label="危险色：">
                <el-color-picker v-model="themeConfig.colors.danger" />
            </el-form-item>
            <el-button type="primary" @click="updateTheme">适用配置</el-button>
        </el-form>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Theme, getTheme, setTheme } from '../utils/theme';

const dialogVisible = ref(false);

const themeConfig = ref<Theme>(Object.assign({}, getTheme()));

const updateTheme = () => setTheme(themeConfig.value);

defineExpose({
    openModal() {
        dialogVisible.value = true;
    },
});
</script>

<style></style>
