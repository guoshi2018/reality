using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components;
using System.ComponentModel;
using BackstageWa.Shared.Components;

namespace BackstageWa.Pages.Exercise.Handly
{
    public partial class BuildContent
    {
        private RenderFragment? DlgtBuildThreeSurveies { get; set; }
        private RenderFragment<string>? DlgBuildThreeSurveyWithParameter { get; set; }
        private RenderFragment? DlgtBuildThreeChecks { get; set; }

        private IDictionary<string, Action<MouseEventArgs>> _dlgtBuildThreeSurveiesHandlers;
        private IDictionary<string, Action<MouseEventArgs>> _dlgtBuildThreeChecksHandlers;

        protected override Task OnInitializedAsync()
        {
            _dlgtBuildThreeSurveiesHandlers =
                new Dictionary<string, Action<MouseEventArgs>>
                {
                    ["普通方法"] = RenderThreeSurveies1,
                    ["inline 写法"] = RenderThreeSurveies2
                };

            DlgBuildThreeSurveyWithParameter = prefix => (RenderTreeBuilder bd) =>
            {
                bd.OpenComponent(0, typeof(SurveyPrompt));
                bd.AddAttribute(1, "Title", $"hello {prefix}");
                bd.CloseComponent();
            };

            _dlgtBuildThreeChecksHandlers = new Dictionary<string, Action<MouseEventArgs>>
            {
                ["使用builder 的open/add/close"] = RenderDivChecks1,
                ["或者,分块渲染, 结合泛型"] = RenderDivChecks2,
                ["inline 法, 不过是又回去了"] = RenderDivChecks3,
            };

            return base.OnInitializedAsync();
        }

        #region 生成3个 survey 组件
        /// <summary>
        /// 普通方法, 即调用RenderTreeBuilder.open/add/close
        /// </summary>
        [Description("普通方法, 即调用RenderTreeBuilder.open/add/close")]
        private void RenderThreeSurveies1(MouseEventArgs me)
        {
            // 或者
            DlgtBuildThreeSurveies = builder =>
            {
                for (var i = 0; i < 3; i++)
                {
                    builder.OpenComponent(0, typeof(SurveyPrompt));
                    builder.AddAttribute(1, "Title", $"title - {i}");
                    builder.CloseComponent();
                }
            };
            // 亦可以将函数在外部定义, 然后在这里赋值
            // DlgtBuildThreeSurveies = GetDlgtForBuildThreeSurvey();        // ok
        }
        // inline  无法存活, 已经移到 .razor 内
        //[Description("inline 写法")]
        //private void RenderThreeSurveies2(MouseEventArgs me)
        //{
        //    // 还可以, 注意参数名必须是 __builder
        //    DlgtBuildThreeSurveies = (RenderTreeBuilder __builder) =>
        //    {
        //        @for(int i = 0; i < 3; i++)
        //    {
        //            string s = $"Title {i}-{me.Detail.ToString()}";
        //        < SurveyPrompt Title = @s />
        //    }
        //    };
        //}
        #endregion

        #region 生成三个 switch 风格的 checkbox
        // 目标, 每个 checkbox 都有自己的 div 包裹
        /*
        * > +	div .form-check .form-check-inline .form-check-reverse .form-switch
           > - input[type=checkbox|radio] .form-check-input [2] [3]
           > - label .form-check-label
         */
        [Description("使用builder 的open/add/close")]
        private void RenderDivChecks1(MouseEventArgs me)
        {
            DlgtBuildThreeChecks = builder =>
            {
                for (var i = 0; i < 3; i++)
                {
                    builder.OpenElement(0, "div");
                    builder.AddAttribute(1, "class", "form-check form-check-inline form-switch");

                    string id = Guid.NewGuid().ToString();
                    builder.OpenElement(0, "input");
                    builder.AddAttribute(1, "type", "checkbox");
                    builder.AddAttribute(2, "class", "form-check-input");
                    builder.AddAttribute(3, "checked");
                    builder.AddAttribute(4, "id", id);
                    builder.CloseElement();

                    builder.OpenElement(0, "label");
                    builder.AddAttribute(1, "class", "form-check-label");
                    builder.AddAttribute(2, "for", id);
                    builder.AddContent(3, $"select {(i + 1) * 3}");
                    builder.CloseElement();

                    builder.CloseElement();
                }
            };
        }

        [Description("或者,分块渲染, 结合泛型")]
        private void RenderDivChecks2(MouseEventArgs me)
        {
            RenderFragment<string> rfCheck = id => bd =>
            {

                bd.OpenElement(0, "input");
                bd.AddAttribute(1, "type", "checkbox");
                bd.AddAttribute(2, "class", "form-check-input");
                bd.AddAttribute(3, "checked");
                bd.AddAttribute(4, "id", id);
                bd.CloseElement();
            };
            RenderFragment<string> rfLabel = (string id) => bd =>
            {
                bd.OpenElement(0, "label");
                bd.AddAttribute(1, "class", "form-check-label");
                bd.AddAttribute(2, "for", id);
                bd.AddContent(3, $"select {id.Substring(5, 3)}");
                bd.CloseElement();
            };
            DlgtBuildThreeChecks = bd =>
            {
                for (int i = 0; i < 3; i++)
                {
                    string id = Guid.NewGuid().ToString();
                    bd.OpenElement(0, "div");
                    bd.AddAttribute(1, "class", "form-check form-check-inline form-switch");
                    bd.AddContent(2, rfCheck, id);
                    bd.AddContent(3, rfLabel, id);
                    bd.CloseElement();
                }
            };
        }

        // inline  无法存活, 已经移到 .razor 内
        //        [Description("inline 法, 不过是又回去了")]
        //        private void RenderDivChecks3(MouseEventArgs me)
        //        {
        //            // 再或者, 又回去了:
        //            DlgtBuildThreeChecks = (RenderTreeBuilder __builder) =>
        //            {
        //            @for(int i = 0; i < 3; i++)
        //            {
        //                string id = $"check-{Guid.NewGuid().ToString()}";
        //                < div class="form-check form-check-inline form-switch">
        //                    <input type = "checkbox" class="form-check-input" checked id="@id">
        //                    <label class="form-check-label" for="@id">select @i</label>
        //                </div>
        //            }
        //};
        //    }


        #endregion

    }
}
