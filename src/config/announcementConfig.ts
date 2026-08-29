export interface AnnouncementConfig {
	enable: boolean;
	title: string;
	content: string;
}

export const announcementConfig: AnnouncementConfig = {
	enable: true,
	title: "公告",
	content: "公告功能正在测试。",
};
