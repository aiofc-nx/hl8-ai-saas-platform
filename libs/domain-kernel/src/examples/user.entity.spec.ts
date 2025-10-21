/**
 * 用户实体测试
 * @description 测试用户实体的功能和业务逻辑
 *
 * @since 1.0.0
 */

import { User } from "./user.entity.js";
import { Email } from "./email.vo.js";
import { Username } from "./username.vo.js";
import { UserStatus, UserStatusTransition } from "./user-status.enum.js";
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

describe("User", () => {
  let user: User;
  let email: Email;
  let username: Username;

  beforeEach(() => {
    email = Email.create("test@example.com");
    username = Username.create("testuser");
    user = User.create(email, username);
  });

  describe("用户创建", () => {
    it("应该创建待激活状态的用户", () => {
      expect(user.getStatus()).toBe(UserStatus.PENDING);
      expect(user.getEmail()).toEqual(email);
      expect(user.getUsername()).toEqual(username);
      expect(user.getActivatedAt()).toBeUndefined();
    });

    it("应该能够从现有数据重建用户", () => {
      const existingUser = User.fromExisting(
        user.id,
        email,
        username,
        UserStatus.ACTIVE,
        new Date("2023-01-01"),
        new Date("2023-01-02"),
        1,
      );

      expect(existingUser.getStatus()).toBe(UserStatus.ACTIVE);
      expect(existingUser.getEmail()).toEqual(email);
      expect(existingUser.getUsername()).toEqual(username);
    });
  });

  describe("用户激活", () => {
    it("应该能够激活待激活的用户", () => {
      user.activate();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
      expect(user.getActivatedAt()).toBeDefined();
      expect(user.isActive()).toBe(true);
      expect(user.isActivated()).toBe(true);
    });

    it("应该能够重复激活已激活的用户", () => {
      user.activate();

      expect(() => user.activate()).toThrow(IsolationValidationError);
    });

    it("应该能够激活已禁用的用户", () => {
      user.activate();
      user.disable();
      user.enable();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
    });
  });

  describe("用户禁用", () => {
    beforeEach(() => {
      user.activate();
    });

    it("应该能够禁用已激活的用户", () => {
      user.disable();

      expect(user.getStatus()).toBe(UserStatus.DISABLED);
      expect(user.isActive()).toBe(false);
    });

    it("应该能够重复禁用已禁用的用户", () => {
      user.disable();

      expect(() => user.disable()).not.toThrow();
    });

    it("应该能够禁用已删除的用户", () => {
      user.delete();

      expect(() => user.disable()).toThrow(IsolationValidationError);
    });
  });

  describe("用户启用", () => {
    beforeEach(() => {
      user.activate();
      user.disable();
    });

    it("应该能够启用已禁用的用户", () => {
      user.enable();

      expect(user.getStatus()).toBe(UserStatus.ACTIVE);
      expect(user.isActive()).toBe(true);
    });

    it("应该能够重复启用已启用的用户", () => {
      user.enable();

      expect(() => user.enable()).not.toThrow();
    });

    it("应该能够启用已删除的用户", () => {
      user.delete();

      expect(() => user.enable()).toThrow(IsolationValidationError);
    });
  });

  describe("用户删除", () => {
    it("应该能够删除任何状态的用户", () => {
      user.delete();

      expect(user.getStatus()).toBe(UserStatus.DELETED);
      expect(user.isDeleted()).toBe(true);
    });

    it("应该能够重复删除已删除的用户", () => {
      user.delete();

      expect(() => user.delete()).toThrow(IsolationValidationError);
    });
  });

  describe("用户信息更新", () => {
    it("应该能够更新用户邮箱", () => {
      const newEmail = Email.create("new@example.com");
      user.updateEmail(newEmail);

      expect(user.getEmail()).toEqual(newEmail);
    });

    it("应该能够更新用户用户名", () => {
      const newUsername = Username.create("newuser");
      user.updateUsername(newUsername);

      expect(user.getUsername()).toEqual(newUsername);
    });

    it("应该能够更新已删除用户的邮箱", () => {
      user.delete();
      const newEmail = Email.create("new@example.com");

      expect(() => user.updateEmail(newEmail)).toThrow(
        IsolationValidationError,
      );
    });

    it("应该能够更新已删除用户的用户名", () => {
      user.delete();
      const newUsername = Username.create("newuser");

      expect(() => user.updateUsername(newUsername)).toThrow(
        IsolationValidationError,
      );
    });
  });

  describe("用户登录记录", () => {
    it("应该能够记录用户登录", () => {
      user.recordLogin();

      expect(user.getLastLoginAt()).toBeDefined();
    });

    it("应该能够重复记录用户登录", () => {
      user.recordLogin();
      const firstLogin = user.getLastLoginAt();

      // 等待一小段时间确保时间不同
      setTimeout(() => {
        user.recordLogin();
        expect(user.getLastLoginAt()).not.toEqual(firstLogin);
      }, 1);
    });
  });

  describe("状态检查", () => {
    it("应该正确检查用户状态", () => {
      expect(user.isActive()).toBe(false);
      expect(user.isActivated()).toBe(false);
      expect(user.isDeleted()).toBe(false);

      user.activate();
      expect(user.isActive()).toBe(true);
      expect(user.isActivated()).toBe(true);
      expect(user.isDeleted()).toBe(false);

      user.delete();
      expect(user.isActive()).toBe(false);
      expect(user.isActivated()).toBe(false);
      expect(user.isDeleted()).toBe(true);
    });
  });

  describe("状态转换", () => {
    it("应该正确验证状态转换", () => {
      expect(user.canTransitionTo(UserStatus.ACTIVE)).toBe(true);
      expect(user.canTransitionTo(UserStatus.DELETED)).toBe(true);
      expect(user.canTransitionTo(UserStatus.DISABLED)).toBe(false);

      user.activate();
      expect(user.canTransitionTo(UserStatus.DISABLED)).toBe(true);
      expect(user.canTransitionTo(UserStatus.DELETED)).toBe(true);
      expect(user.canTransitionTo(UserStatus.PENDING)).toBe(false);
    });

    it("应该返回允许的状态转换", () => {
      const allowedTransitions = user.getAllowedTransitions();
      expect(allowedTransitions).toContain(UserStatus.ACTIVE);
      expect(allowedTransitions).toContain(UserStatus.DELETED);
      expect(allowedTransitions).not.toContain(UserStatus.DISABLED);

      user.activate();
      const newAllowedTransitions = user.getAllowedTransitions();
      expect(newAllowedTransitions).toContain(UserStatus.DISABLED);
      expect(newAllowedTransitions).toContain(UserStatus.DELETED);
      expect(newAllowedTransitions).not.toContain(UserStatus.PENDING);
    });
  });

  describe("实体相等性", () => {
    it("应该正确比较实体相等性", () => {
      const sameUser = User.fromExisting(
        user.id,
        email,
        username,
        UserStatus.PENDING,
      );

      expect(user.equals(sameUser)).toBe(true);
      expect(user.equals(undefined)).toBe(false);
    });

    it("应该正确比较不同实体的相等性", () => {
      const differentUser = User.create(
        Email.create("other@example.com"),
        Username.create("otheruser"),
      );

      expect(user.equals(differentUser)).toBe(false);
    });
  });
});
