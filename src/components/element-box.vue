<template>
    <el-row class="mb-2" :gutter="24">
        <el-col :span="2">
            <p class="title">按钮：</p>
        </el-col>
        <el-col :span="4">
            <el-button type="primary">primary 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="success">success 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="danger">danger 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="info">info 按钮</el-button>
        </el-col>
        <el-col :span="4">
            <el-button type="warning">warning 按钮</el-button>
        </el-col>
    </el-row>
    <p class="title">表单：</p>
    <el-form :label-width="120" label-position="left">
        <el-form-item label="Activity name">
            <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Activity zone">
            <el-select
                v-model="form.region"
                placeholder="please select your zone"
            >
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
            </el-select>
        </el-form-item>
        <el-form-item label="Activity time">
            <el-date-picker
                v-model="form.date1"
                type="date"
                placeholder="Pick a date"
            />
            <span class="text-info-deeper mr-8">-</span>
            <el-time-picker v-model="form.date2" placeholder="Pick a time" />
        </el-form-item>
        <el-form-item label="Instant delivery">
            <el-switch v-model="form.delivery" />
        </el-form-item>
        <el-form-item label="Activity type">
            <el-checkbox-group v-model="form.type">
                <el-checkbox label="Online activities" name="type" />
                <el-checkbox label="Promotion activities" name="type" />
                <el-checkbox label="Offline activities" name="type" />
                <el-checkbox label="Simple brand exposure" name="type" />
            </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Resources">
            <el-radio-group v-model="form.resource">
                <el-radio label="Sponsor" />
                <el-radio label="Venue" />
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Activity form">
            <el-input v-model="form.desc" type="textarea" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
            <el-button>Cancel</el-button>
        </el-form-item>
    </el-form>
    <p class="title">标签：</p>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1 line-height-2">Dark</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            :type="item.type"
            class="mx-1"
            effect="dark"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            :type="item.type"
            class="mx-1"
            effect="dark"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1">Light</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="light"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="light"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
    <div class="tag-group my-2 flex flex-wrap gap-1 items-center">
        <span class="tag-group__title m-1">Plain</span>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="plain"
        >
            {{ item.label }}
        </el-tag>
        <el-tag
            v-for="item in items"
            :key="item.label"
            class="mx-1"
            :type="item.type"
            effect="plain"
            closable
        >
            {{ item.label }}
        </el-tag>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { ref } from 'vue';
import type { TagProps } from 'element-plus';

const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
});
const onSubmit = () => {
    console.log('submit!');
};

type Item = { type: TagProps['type']; label: string };

const items = ref<Array<Item>>([
    { type: '', label: 'Tag 1' },
    { type: 'success', label: 'Tag 2' },
    { type: 'info', label: 'Tag 3' },
    { type: 'danger', label: 'Tag 4' },
    { type: 'warning', label: 'Tag 5' },
]);
</script>

<style lang="scss" scoped>
.title {
    @apply leading-8 text-base font-bold;
}
</style>
