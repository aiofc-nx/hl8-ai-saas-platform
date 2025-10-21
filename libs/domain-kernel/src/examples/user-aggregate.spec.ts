/**
 * 用户聚合根测试
 * @description 测试用户聚合根的功能和实体与聚合根分离模式
 *
 * @since 1.0.0
 */

import { UserAggregate } from "./user-aggregate.js";
import { User } from "./user.entity.js";
import { Email } from "./email.vo.js";
import { Username } from "./username.vo.js";
import { UserId } from "../value-objects/ids/user-id.vo.js";
import { TenantId } from "../value-objects/ids/tenant-id.vo.js";
import { UserStatus } from "./user-status.enum.js";
import { IsolationValidationError } from "../isolation/isolation-validation.error.js";

describe("UserAggregate", () => {
  let userAggregate: UserAggregate;
  let email: Email;
  let username: Username;
  let userId: UserId;
  let tenantId: TenantId;

  beforeEach(() => {
    userId = UserId.create();
    tenantId = TenantId.create("t123");
    userAggregate = new UserAggregate(userId, tenantId);
    email = Email.create("test@example.com");
    username = Username.create("testuser");
  });

  describe("用户创建", () => {
    it("应该能够创建用户", () => {
      userAggregate.createUser(email, username);

      expect(userAggregate.getUser()).toBeDefined();
      expect(userAggregate.getUser()?.getEmail()).toEqual(email);
      expect(userAggregate.getUser()?.getUsername()).toEqual(username);
      expect(userAggregate.getUser()?.getStatus()).toBe(UserStatus.PENDING);
    });

    it("应该发布用户创建事件", () => {
      userAggregate.createUser(email, username);

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("UserCreated");
      expect(events[0].eventData.email).toBe(email.getValue());
      expect(events[0].eventData.username).toBe(username.getValue());
    });
  });

  describe("用户激活", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
    });

    it("应该能够激活用户", () => {
      userAggregate.activateUser();

      expect(userAggregate.getUser()?.getStatus()).toBe(UserStatus.ACTIVE);
      expect(userAggregate.getUser()?.getActivatedAt()).toBeDefined();
    });

    it("应该发布用户激活事件", () => {
      userAggregate.activateUser();

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(2); // UserCreated + UserActivated
      expect(events[1].eventType).toBe("UserActivated");
    });

    it("应该能够重复激活已激活的用户", () => {
      userAggregate.activateUser();

      expect(() => userAggregate.activateUser()).toThrow(
        IsolationValidationError,
      );
    });
  });

  describe("用户禁用", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
      userAggregate.activateUser();
    });

    it("应该能够禁用用户", () => {
      userAggregate.disableUser();

      expect(userAggregate.getUser()?.getStatus()).toBe(UserStatus.DISABLED);
    });

    it("应该发布用户禁用事件", () => {
      userAggregate.disableUser();

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(3); // UserCreated + UserActivated + UserDisabled
      expect(events[2].eventType).toBe("UserDisabled");
    });
  });

  describe("用户启用", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
      userAggregate.activateUser();
      userAggregate.disableUser();
    });

    it("应该能够启用用户", () => {
      userAggregate.enableUser();

      expect(userAggregate.getUser()?.getStatus()).toBe(UserStatus.ACTIVE);
    });

    it("应该发布用户启用事件", () => {
      userAggregate.enableUser();

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(4); // UserCreated + UserActivated + UserDisabled + UserEnabled
      expect(events[3].eventType).toBe("UserEnabled");
    });
  });

  describe("用户删除", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
    });

    it("应该能够删除用户", () => {
      userAggregate.deleteUser();

      expect(userAggregate.getUser()?.getStatus()).toBe(UserStatus.DELETED);
    });

    it("应该发布用户删除事件", () => {
      userAggregate.deleteUser();

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(2); // UserCreated + UserDeleted
      expect(events[1].eventType).toBe("UserDeleted");
    });
  });

  describe("用户信息更新", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
    });

    it("应该能够更新用户邮箱", () => {
      const newEmail = Email.create("new@example.com");
      userAggregate.updateUserEmail(newEmail);

      expect(userAggregate.getUser()?.getEmail()).toEqual(newEmail);
    });

    it("应该发布邮箱更新事件", () => {
      const newEmail = Email.create("new@example.com");
      userAggregate.updateUserEmail(newEmail);

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(2); // UserCreated + UserEmailUpdated
      expect(events[1].eventType).toBe("UserEmailUpdated");
      expect(events[1].eventData.newEmail).toBe(newEmail.getValue());
    });

    it("应该能够更新用户用户名", () => {
      const newUsername = Username.create("newuser");
      userAggregate.updateUserUsername(newUsername);

      expect(userAggregate.getUser()?.getUsername()).toEqual(newUsername);
    });

    it("应该发布用户名更新事件", () => {
      const newUsername = Username.create("newuser");
      userAggregate.updateUserUsername(newUsername);

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(2); // UserCreated + UserUsernameUpdated
      expect(events[1].eventType).toBe("UserUsernameUpdated");
      expect(events[1].eventData.newUsername).toBe(newUsername.getValue());
    });
  });

  describe("用户登录记录", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
      userAggregate.activateUser();
    });

    it("应该能够记录用户登录", () => {
      userAggregate.recordUserLogin();

      expect(userAggregate.getUser()?.getLastLoginAt()).toBeDefined();
    });

    it("应该发布用户登录事件", () => {
      userAggregate.recordUserLogin();

      const events = userAggregate.pullEvents();
      expect(events).toHaveLength(3); // UserCreated + UserActivated + UserLoggedIn
      expect(events[2].eventType).toBe("UserLoggedIn");
    });
  });

  describe("错误处理", () => {
    it("应该在用户不存在时抛出异常", () => {
      expect(() => userAggregate.activateUser()).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.disableUser()).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.enableUser()).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.deleteUser()).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.updateUserEmail(email)).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.updateUserUsername(username)).toThrow(
        IsolationValidationError,
      );
      expect(() => userAggregate.recordUserLogin()).toThrow(
        IsolationValidationError,
      );
    });
  });

  describe("快照功能", () => {
    beforeEach(() => {
      userAggregate.createUser(email, username);
      userAggregate.activateUser();
    });

    it("应该能够创建快照", () => {
      const snapshot = userAggregate.createSnapshot();

      expect(snapshot.userId).toBe(userId.getValue());
      expect(snapshot.tenantId).toBe(tenantId.getValue());
      expect(snapshot.user).toBeDefined();
      expect(snapshot.user.email).toBe(email.getValue());
      expect(snapshot.user.username).toBe(username.getValue());
      expect(snapshot.user.status).toBe(UserStatus.ACTIVE);
    });

    it("应该能够从快照恢复", () => {
      const snapshot = userAggregate.createSnapshot();
      const newAggregate = new UserAggregate(userId, tenantId);

      newAggregate.restoreFromSnapshot(snapshot, userAggregate.version);

      expect(newAggregate.getUser()?.getEmail()).toEqual(email);
      expect(newAggregate.getUser()?.getUsername()).toEqual(username);
      expect(newAggregate.getUser()?.getStatus()).toBe(UserStatus.ACTIVE);
    });
  });
});
